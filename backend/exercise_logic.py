from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Literal, Sequence

import numpy as np

ExerciseName = Literal["bicep-curl", "squat", "pushup"]
ExerciseStage = Literal["up", "down"]
ExerciseSide = Literal["left", "right"]

MIN_VISIBILITY = 0.35
MOVEMENT_EPSILON = 3

LEFT_INDEXES = {
    "shoulder": 11,
    "elbow": 13,
    "wrist": 15,
    "hip": 23,
    "knee": 25,
    "ankle": 27,
}

RIGHT_INDEXES = {
    "shoulder": 12,
    "elbow": 14,
    "wrist": 16,
    "hip": 24,
    "knee": 26,
    "ankle": 28,
}

EXERCISE_LABELS: dict[ExerciseName, str] = {
    "bicep-curl": "Bicep Curls",
    "squat": "Squats",
    "pushup": "Pushups",
}


@dataclass
class WorkoutState:
    counter: int
    stage: ExerciseStage
    angle: float
    accuracy: float
    feedback: str
    is_correct_form: bool

    def to_dict(self) -> dict[str, int | float | str | bool]:
        return {
            "counter": self.counter,
            "stage": self.stage,
            "angle": round(self.angle, 1),
            "accuracy": round(self.accuracy, 1),
            "feedback": self.feedback,
            "isCorrectForm": self.is_correct_form,
        }


def create_initial_state(exercise: ExerciseName) -> WorkoutState:
    initial_stage: ExerciseStage = "down" if exercise == "bicep-curl" else "up"

    return WorkoutState(
        counter=0,
        stage=initial_stage,
        angle=180.0,
        accuracy=0.0,
        feedback="Choose your pose and press start to begin tracking.",
        is_correct_form=False,
    )


def calculate_angle(a, b, c) -> float:
    """Return the angle ABC in degrees and keep it inside 0-180."""
    point_a = np.array([a.x, a.y], dtype=np.float32)
    point_b = np.array([b.x, b.y], dtype=np.float32)
    point_c = np.array([c.x, c.y], dtype=np.float32)

    radians = math.atan2(point_c[1] - point_b[1], point_c[0] - point_b[0]) - math.atan2(
        point_a[1] - point_b[1], point_a[0] - point_b[0]
    )

    angle = abs(math.degrees(radians))
    return 360.0 - angle if angle > 180.0 else angle


def _is_visible(landmark, threshold: float = MIN_VISIBILITY) -> bool:
    visibility = getattr(landmark, "visibility", 1.0)
    return visibility >= threshold


def _visibility_score(landmarks: Sequence, indexes: dict[str, int]) -> int:
    return sum(1 for index in indexes.values() if _is_visible(landmarks[index]))


def resolve_tracking_side(landmarks: Sequence) -> ExerciseSide:
    left_score = _visibility_score(landmarks, LEFT_INDEXES)
    right_score = _visibility_score(landmarks, RIGHT_INDEXES)
    return "right" if right_score >= left_score else "left"


def _get_side_points(landmarks: Sequence, side: ExerciseSide) -> dict[str, object]:
    indexes = LEFT_INDEXES if side == "left" else RIGHT_INDEXES
    return {name: landmarks[index] for name, index in indexes.items()}


def _visible_points(points: dict[str, object]) -> bool:
    return all(_is_visible(point) for point in points.values())


def _horizontal_distance(a, b) -> float:
    return float(np.linalg.norm(np.array([a.x]) - np.array([b.x])))


def _calculate_back_lean(shoulder, hip) -> float:
    return math.degrees(math.atan2(abs(shoulder.x - hip.x), abs(shoulder.y - hip.y)))


def _clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def _score_from_upper_bound(value: float, ideal: float, fail: float) -> float:
    """Return 100 near the ideal threshold and 0 when the metric gets too large."""
    if value <= ideal:
        return 100.0
    if value >= fail:
        return 0.0
    return _clamp(100.0 * (1.0 - ((value - ideal) / (fail - ideal))))


def _score_from_lower_bound(value: float, ideal: float, fail: float) -> float:
    """Return 100 near the ideal minimum and 0 when the metric drops too low."""
    if value >= ideal:
        return 100.0
    if value <= fail:
        return 0.0
    return _clamp(100.0 * ((value - fail) / (ideal - fail)))


def _missing_pose_state(previous_state: WorkoutState, message: str) -> WorkoutState:
    return WorkoutState(
        counter=previous_state.counter,
        stage=previous_state.stage,
        angle=previous_state.angle,
        accuracy=0.0,
        feedback=message,
        is_correct_form=False,
    )


def analyze_bicep_curl(
    landmarks: Sequence,
    previous_state: WorkoutState,
    tracked_side: ExerciseSide,
) -> WorkoutState:
    points = _get_side_points(landmarks, tracked_side)
    focus_points = {
        "shoulder": points["shoulder"],
        "elbow": points["elbow"],
        "wrist": points["wrist"],
    }

    if not _visible_points(focus_points):
        return _missing_pose_state(
            previous_state,
            "Keep your shoulder, elbow, and wrist inside the frame.",
        )

    shoulder = focus_points["shoulder"]
    elbow = focus_points["elbow"]
    wrist = focus_points["wrist"]

    angle = calculate_angle(shoulder, elbow, wrist)
    elbow_drifting = _horizontal_distance(shoulder, elbow) > 0.12
    lifting = angle < previous_state.angle - MOVEMENT_EPSILON
    lowering = angle > previous_state.angle + MOVEMENT_EPSILON
    partial_top_rep = previous_state.stage == "down" and lowering and 50 < angle < 160
    partial_bottom_rep = previous_state.stage == "up" and lifting and 50 < angle < 160

    counter = previous_state.counter
    stage = previous_state.stage

    if angle > 160:
        stage = "down"

    if angle < 50 and previous_state.stage == "down" and not elbow_drifting:
        stage = "up"
        counter += 1

    elbow_score = _score_from_upper_bound(_horizontal_distance(shoulder, elbow), 0.06, 0.18)
    motion_score = 100.0

    if partial_top_rep:
        motion_score = 52.0
    elif partial_bottom_rep:
        motion_score = 58.0
    elif 50 <= angle <= 160:
        motion_score = 88.0

    accuracy = (elbow_score * 0.6) + (motion_score * 0.4)
    feedback = "Smooth curl. Keep the elbow tucked near your torso."

    if elbow_drifting:
        feedback = "Keep your elbow closer to your body."
        accuracy = min(accuracy, 48.0)
    elif partial_top_rep:
        feedback = "Curl a little higher to complete the rep."
        accuracy = min(accuracy, 60.0)
    elif partial_bottom_rep:
        feedback = "Lower your arm fully for full extension."
        accuracy = min(accuracy, 64.0)
    elif angle > 160:
        feedback = "Great extension. Start the next curl."
    elif angle < 50:
        feedback = "Nice squeeze at the top."

    accuracy = round(_clamp(accuracy), 1)
    return WorkoutState(counter, stage, angle, accuracy, feedback, accuracy >= 70.0)


def analyze_squat(
    landmarks: Sequence,
    previous_state: WorkoutState,
    tracked_side: ExerciseSide,
) -> WorkoutState:
    points = _get_side_points(landmarks, tracked_side)
    focus_points = {
        "shoulder": points["shoulder"],
        "hip": points["hip"],
        "knee": points["knee"],
        "ankle": points["ankle"],
    }

    if not _visible_points(focus_points):
        return _missing_pose_state(
            previous_state,
            "Keep your full side profile visible for squat tracking.",
        )

    shoulder = focus_points["shoulder"]
    hip = focus_points["hip"]
    knee = focus_points["knee"]
    ankle = focus_points["ankle"]

    angle = calculate_angle(hip, knee, ankle)
    back_lean = _calculate_back_lean(shoulder, hip)
    knees_too_forward = _horizontal_distance(knee, ankle) > 0.18
    standing_up = angle > previous_state.angle + MOVEMENT_EPSILON
    shallow_squat = previous_state.stage == "up" and standing_up and 95 <= previous_state.angle < 125

    counter = previous_state.counter
    stage = previous_state.stage

    if angle < 90:
        stage = "down"

    if angle > 160 and previous_state.stage == "down" and back_lean <= 35 and not knees_too_forward:
        stage = "up"
        counter += 1
    elif angle > 160:
        stage = "up"

    back_score = _score_from_upper_bound(back_lean, 14.0, 42.0)
    knee_score = _score_from_upper_bound(_horizontal_distance(knee, ankle), 0.08, 0.22)
    depth_score = 100.0

    if shallow_squat:
        depth_score = 54.0
    elif 90 <= angle <= 150:
        depth_score = 88.0

    accuracy = (back_score * 0.4) + (knee_score * 0.35) + (depth_score * 0.25)
    feedback = "Sit back, keep your chest lifted, and control the movement."

    if back_lean > 35:
        feedback = "Lift your chest and keep your back straighter."
        accuracy = min(accuracy, 56.0)
    elif knees_too_forward:
        feedback = "Keep your knees stacked closer to your ankles."
        accuracy = min(accuracy, 60.0)
    elif shallow_squat:
        feedback = "Go a little lower to reach full squat depth."
        accuracy = min(accuracy, 63.0)
    elif angle < 90:
        feedback = "Good squat depth. Drive back up."
    elif angle > 160:
        feedback = "Strong lockout. Ready for the next squat."

    accuracy = round(_clamp(accuracy), 1)
    return WorkoutState(counter, stage, angle, accuracy, feedback, accuracy >= 70.0)


def analyze_pushup(
    landmarks: Sequence,
    previous_state: WorkoutState,
    tracked_side: ExerciseSide,
) -> WorkoutState:
    points = _get_side_points(landmarks, tracked_side)
    focus_points = {
        "shoulder": points["shoulder"],
        "elbow": points["elbow"],
        "wrist": points["wrist"],
        "hip": points["hip"],
        "ankle": points["ankle"],
    }

    if not _visible_points(focus_points):
        return _missing_pose_state(
            previous_state,
            "Keep your shoulder, hip, and ankle visible for push-up tracking.",
        )

    shoulder = focus_points["shoulder"]
    elbow = focus_points["elbow"]
    wrist = focus_points["wrist"]
    hip = focus_points["hip"]
    ankle = focus_points["ankle"]

    angle = calculate_angle(shoulder, elbow, wrist)
    body_line_angle = calculate_angle(shoulder, hip, ankle)
    body_is_straight = body_line_angle > 160
    pressing_up = angle > previous_state.angle + MOVEMENT_EPSILON
    lowering = angle < previous_state.angle - MOVEMENT_EPSILON
    incomplete_depth = previous_state.stage == "up" and pressing_up and 90 <= previous_state.angle < 125
    incomplete_extension = (
        previous_state.stage == "down"
        and lowering
        and previous_state.angle > 120
        and angle < 160
    )

    counter = previous_state.counter
    stage = previous_state.stage

    if angle < 90:
        stage = "down"

    if angle > 160 and previous_state.stage == "down" and body_is_straight:
        stage = "up"
        counter += 1
    elif angle > 160:
        stage = "up"

    body_line_score = _score_from_lower_bound(body_line_angle, 168.0, 138.0)
    range_score = 100.0

    if incomplete_depth:
        range_score = 54.0
    elif incomplete_extension:
        range_score = 60.0
    elif 90 <= angle <= 150:
        range_score = 88.0

    accuracy = (body_line_score * 0.7) + (range_score * 0.3)
    feedback = "Keep your body in one straight line as you move."

    if not body_is_straight:
        feedback = "Keep your shoulders, hips, and ankles aligned."
        accuracy = min(accuracy, 52.0)
    elif incomplete_depth:
        feedback = "Lower a little more to complete the push-up."
        accuracy = min(accuracy, 60.0)
    elif incomplete_extension:
        feedback = "Press all the way up to finish the rep."
        accuracy = min(accuracy, 62.0)
    elif angle < 90:
        feedback = "Good depth. Push back up."
    elif angle > 160:
        feedback = "Nice plank line. Start the next rep."

    accuracy = round(_clamp(accuracy), 1)
    return WorkoutState(counter, stage, angle, accuracy, feedback, accuracy >= 70.0)


def analyze_exercise(
    exercise: ExerciseName,
    landmarks: Sequence,
    previous_state: WorkoutState,
    tracked_side: ExerciseSide | None = None,
) -> WorkoutState:
    side = tracked_side or resolve_tracking_side(landmarks)

    if exercise == "bicep-curl":
        return analyze_bicep_curl(landmarks, previous_state, side)
    if exercise == "squat":
        return analyze_squat(landmarks, previous_state, side)
    if exercise == "pushup":
        return analyze_pushup(landmarks, previous_state, side)

    return previous_state
