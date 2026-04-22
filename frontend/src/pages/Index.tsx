import { useState } from "react";
import {
  ArrowRight,
  Camera,
  CircleStop,
  Dumbbell,
  Hand,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Waves,
} from "lucide-react";
import { ExerciseCard } from "../components/ExerciseCard";
import { WorkoutOverlay } from "../components/WorkoutOverlay";
import { useVoiceCoach } from "../hooks/useVoiceCoach";
import { useWorkoutSession } from "../hooks/useWorkoutSession";
import {
  EXERCISE_OPTIONS,
  formatDuration,
  getExerciseLabel,
  type ExerciseName,
} from "../utils/workout";

const iconMap = {
  "bicep-curl": Dumbbell,
  squat: Waves,
  pushup: Hand,
};

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Exercises", href: "#exercises" },
  { label: "Studio", href: "#studio" },
  { label: "Insights", href: "#insights" },
];

export const IndexPage = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseName | null>(null);
  const { status, error, isLoading, streamUrl, startSession, stopSession } = useWorkoutSession();
  useVoiceCoach(status);

  const selectedOption =
    EXERCISE_OPTIONS.find((option) => option.id === selectedExercise) ?? null;

  const activeExerciseLabel = getExerciseLabel(status.exercise ?? selectedExercise);
  const postureLabel = status.isCorrectForm ? "Form aligned" : "Needs correction";
  const studioHeadline = isLoading
    ? "Connecting to your camera"
    : "Live coaching stream loads here";
  const studioDescription = isLoading
    ? "The backend is opening the webcam and warming up pose tracking. Your full camera frame will appear here in a moment."
    : "Pick an exercise, press Start Workout, and the processed backend camera feed will appear with posture validation, rep counting, and the green or red skeleton overlay.";

  const handleStart = async () => {
    await startSession(selectedExercise);
  };

  return (
    <main id="home" className="dashboard-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-8">
        <section className="hero-shell relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8 lg:px-10">
          <div className="relative z-10 flex flex-col gap-8">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd84d] text-slate-950 shadow-[0_12px_28px_rgba(255,216,77,0.35)]">
                  <Radar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-cyan-200/70">
                    AI Smart Fitness Trainer
                  </p>
                  <p className="font-display text-xl text-white">Posture-aware Workout Studio</p>
                </div>
              </div>

              <nav className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </header>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  Select exercise before camera start
                </div>

                <h1 className="mt-6 max-w-xl font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  Train with a more interactive AI coach that reacts in real time.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
                  Your Python backend still owns the webcam and pose analysis. This refreshed
                  interface turns it into a livelier studio with a stronger hero section,
                  clearer feedback, and a more presentation-ready experience.
                </p>

                <div className="mt-7 rounded-[32px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
                        Workout Ready State
                      </p>
                      <p className="mt-2 font-display text-2xl text-white">
                        {selectedOption ? selectedOption.title : "Choose a movement to arm the coach"}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
                      {status.isRunning ? "Session Live" : "Camera Offline"}
                    </div>
                  </div>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
                    {selectedOption
                      ? selectedOption.cue
                      : "The interface stays interactive, but the webcam remains off until one exercise is selected and Start Workout is pressed."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={!selectedExercise || status.isRunning || isLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ffd84d] px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#ffe37b] disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      <Camera className="h-4 w-4" />
                      {isLoading ? "Connecting..." : "Start Workout"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void stopSession()}
                      disabled={!status.isRunning || isLoading}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-300/[0.35] bg-cyan-300/10 px-6 py-3 text-sm font-semibold text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-300/[0.18] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CircleStop className="h-4 w-4" />
                      Stop Workout
                    </button>

                    <a
                      href="#exercises"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                    >
                      Explore Exercises
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>

                  {error ? (
                    <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="status-chip">
                    <p className="status-chip__label">Reps</p>
                    <p className="status-chip__value">{status.counter}</p>
                  </div>
                  <div className="status-chip">
                    <p className="status-chip__label">Live Accuracy</p>
                    <p className="status-chip__value">{Math.round(status.accuracy)}%</p>
                  </div>
                  <div className="status-chip">
                    <p className="status-chip__label">Duration</p>
                    <p className="status-chip__value">{formatDuration(status.duration)}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="hero-blob mx-auto max-w-[640px] p-5 sm:p-7">
                  <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr] lg:items-center">
                    <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden rounded-[42px] bg-slate-950/[0.15] px-4 pb-6 pt-10">
                      <div className="hero-badge left-4 top-4">
                        <ShieldCheck className="h-4 w-4" />
                        Voice + form coach
                      </div>
                      <div className="hero-badge right-4 top-24 bg-slate-950/80 text-cyan-50">
                        <TimerReset className="h-4 w-4" />
                        30-frame average
                      </div>

                      <div className="coach-avatar">
                        <div className="coach-shadow" />
                        <div className="coach-leg coach-leg--left" />
                        <div className="coach-leg coach-leg--right" />
                        <div className="coach-body" />
                        <div className="coach-arm coach-arm--left" />
                        <div className="coach-arm coach-arm--right" />
                        <div className="coach-head" />
                        <div className="coach-hair" />
                        <div className="coach-tablet" />
                      </div>

                      <div className="hero-float-card left-3 bottom-4">
                        <p className="hero-float-card__label">Exercise Focus</p>
                        <p className="hero-float-card__value">
                          {selectedOption?.focus ?? "Pick an exercise"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[28px] border border-white/[0.18] bg-slate-950/30 p-5 text-white shadow-[0_22px_40px_rgba(9,18,34,0.18)] backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
                          Live Persona
                        </p>
                        <h2 className="mt-3 font-display text-3xl text-white">
                          {activeExerciseLabel}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-cyan-50/[0.85]">
                          {status.feedback}
                        </p>
                        <div className="mt-5 space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-cyan-50/75">
                              <span>Posture quality</span>
                              <span>{Math.round(status.averageAccuracy)}%</span>
                            </div>
                            <div className="mt-2 h-2.5 rounded-full bg-white/[0.15]">
                              <div
                                className="h-full rounded-full bg-[#ffd84d] transition-all duration-500"
                                style={{ width: `${Math.max(6, status.averageAccuracy)}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4">
                              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/[0.65]">
                                Mode
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {status.isRunning ? "Tracking live" : "Awaiting start"}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/[0.12] bg-white/[0.08] p-4">
                              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/[0.65]">
                                Posture
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">{postureLabel}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[24px] border border-white/[0.18] bg-white/10 p-4 text-slate-950 shadow-[0_18px_40px_rgba(17,83,114,0.18)] backdrop-blur-xl">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-900/60">
                            Accuracy
                          </p>
                          <p className="mt-2 font-display text-3xl text-slate-950">
                            {Math.round(status.accuracy)}%
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-white/[0.18] bg-white/10 p-4 text-slate-950 shadow-[0_18px_40px_rgba(17,83,114,0.18)] backdrop-blur-xl">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-900/60">
                            Landmarks
                          </p>
                          <p className="mt-2 font-display text-3xl text-slate-950">
                            {status.landmarks.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="exercises" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                Exercise Collection
              </p>
              <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
                Interactive movement cards
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              Tap a card to prepare the workout
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {EXERCISE_OPTIONS.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                title={exercise.title}
                description={exercise.description}
                cue={exercise.cue}
                focus={exercise.focus}
                icon={iconMap[exercise.id]}
                selected={selectedExercise === exercise.id}
                disabled={status.isRunning}
                onSelect={() => setSelectedExercise(exercise.id)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
          <div className="glass-panel px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
                  Session Rules
                </p>
                <h3 className="mt-2 font-display text-3xl text-white">
                  Smooth workflow for demos and live use
                </h3>
              </div>
              <div className="rounded-2xl bg-cyan-300/[0.12] p-3 text-cyan-100">
                <ScanSearch className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="guide-card">
                <p className="guide-card__index">01</p>
                <p className="guide-card__title">Select</p>
                <p className="guide-card__body">
                  Pick Bicep Curls, Squats, or Pushups before the camera is allowed to begin.
                </p>
              </div>
              <div className="guide-card">
                <p className="guide-card__index">02</p>
                <p className="guide-card__title">Start</p>
                <p className="guide-card__body">
                  The backend opens the webcam only after you press Start Workout.
                </p>
              </div>
              <div className="guide-card">
                <p className="guide-card__index">03</p>
                <p className="guide-card__title">Coach</p>
                <p className="guide-card__body">
                  Watch the stream, hear spoken corrections, and follow the green or red skeleton.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
              AI Summary
            </p>
            <h3 className="mt-2 font-display text-3xl text-white">Current coaching state</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The backend keeps the pose logic stable while the frontend now presents the session
              with a stronger story and a more polished visual rhythm.
            </p>

            <div className="mt-6 space-y-3">
              <div className="summary-pill">
                <span>Current exercise</span>
                <strong>{activeExerciseLabel}</strong>
              </div>
              <div className="summary-pill">
                <span>Camera backend</span>
                <strong>{status.cameraBackend ?? "Waiting"}</strong>
              </div>
              <div className="summary-pill">
                <span>Voice coach</span>
                <strong>{status.isRunning ? "Active" : "Standby"}</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="studio" className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr] xl:items-start">
          <div className="glass-panel overflow-hidden p-3 sm:p-4">
            <div className="stream-frame relative aspect-[16/10] overflow-hidden rounded-[30px] sm:aspect-video">
              {streamUrl ? (
                <>
                  <img
                    src={streamUrl}
                    alt="Processed workout stream"
                    className="h-full w-full bg-slate-950 object-contain"
                  />
                  <WorkoutOverlay status={status} />
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 shadow-[0_24px_40px_rgba(0,0,0,0.28)]">
                    <Radar className="h-10 w-10" />
                  </div>
                  <h3 className="mt-6 font-display text-3xl sm:text-4xl">{studioHeadline}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                    {studioDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div id="insights" className="space-y-6 xl:sticky xl:top-6">
            <div className="glass-panel px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
                Live Insights
              </p>
              <h3 className="mt-2 font-display text-3xl text-white">Performance dashboard</h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="insight-card">
                  <p className="insight-card__label">Exercise</p>
                  <p className="insight-card__value">{activeExerciseLabel}</p>
                </div>
                <div className="insight-card">
                  <p className="insight-card__label">Reps Counted</p>
                  <p className="insight-card__value">{status.counter}</p>
                </div>
                <div className="insight-card">
                  <p className="insight-card__label">Current Angle</p>
                  <p className="insight-card__value">{Math.round(status.angle)}&deg;</p>
                </div>
                <div className="insight-card">
                  <p className="insight-card__label">Rolling Average</p>
                  <p className="insight-card__value">{Math.round(status.averageAccuracy)}%</p>
                </div>
                <div className="insight-card">
                  <p className="insight-card__label">Landmarks</p>
                  <p className="insight-card__value">{status.landmarks.length}</p>
                </div>
                <div className="insight-card">
                  <p className="insight-card__label">Duration</p>
                  <p className="insight-card__value">{formatDuration(status.duration)}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200/70">
                Architecture Choice
              </p>
              <h3 className="mt-2 font-display text-3xl text-white">
                Backend-controlled camera, frontend-led experience
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                FastAPI, OpenCV, and MediaPipe stay responsible for the camera and pose pipeline.
                React now focuses on a more interactive presentation layer that is easier to demo
                and much closer to the visual energy of your reference.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
