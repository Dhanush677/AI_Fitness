import { Activity, Clock3, Repeat2, ShieldCheck, TriangleAlert } from "lucide-react";
import { formatDuration, getExerciseLabel, type SessionStatus } from "../utils/workout";

type WorkoutOverlayProps = {
  status: SessionStatus;
};

export const WorkoutOverlay = ({ status }: WorkoutOverlayProps) => {
  const statusLabel = status.isCorrectForm ? "Correct posture" : "Adjust posture";
  const statusIcon = status.isCorrectForm ? ShieldCheck : TriangleAlert;
  const StatusIcon = statusIcon;
  const accuracyTone =
    status.accuracy >= 85
      ? "text-emerald-200"
      : status.accuracy >= 70
        ? "text-amber-200"
        : "text-rose-200";

  return (
    <>
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-2 sm:inset-x-4 sm:top-4 sm:gap-3">
        <div className="rounded-[20px] border border-white/[0.12] bg-slate-950/[0.64] px-3 py-2.5 text-white shadow-[0_22px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[24px] sm:px-4 sm:py-3">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">Exercise</p>
          <p className="mt-1 font-display text-lg sm:text-xl">{getExerciseLabel(status.exercise)}</p>
        </div>

        <div className="rounded-[20px] border border-white/[0.12] bg-slate-950/[0.64] px-3 py-2.5 text-white shadow-[0_22px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[24px] sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">
            <Repeat2 className="h-4 w-4" />
            Reps
          </div>
          <p className="mt-1 font-display text-2xl sm:text-3xl">{status.counter}</p>
        </div>

        <div className="rounded-[20px] border border-white/[0.12] bg-slate-950/[0.64] px-3 py-2.5 text-white shadow-[0_22px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[24px] sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">
            <Activity className="h-4 w-4" />
            Angle
          </div>
          <p className="mt-1 font-display text-2xl sm:text-3xl">{Math.round(status.angle)}&deg;</p>
        </div>

        <div className="hidden rounded-[20px] border border-white/[0.12] bg-slate-950/[0.64] px-3 py-2.5 text-white shadow-[0_22px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:block sm:rounded-[24px] sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">
            <Clock3 className="h-4 w-4" />
            Duration
          </div>
          <p className="mt-1 font-display text-2xl sm:text-3xl">{formatDuration(status.duration)}</p>
        </div>

        <div className="rounded-[20px] border border-white/[0.12] bg-slate-950/[0.64] px-3 py-2.5 text-white shadow-[0_22px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:rounded-[24px] sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">
            <ShieldCheck className="h-4 w-4" />
            Accuracy
          </div>
          <p className={["mt-1 font-display text-2xl sm:text-3xl", accuracyTone].join(" ")}>
            {Math.round(status.accuracy)}%
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-[24px] border border-white/[0.12] bg-slate-950/[0.74] p-4 text-white shadow-[0_24px_46px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-[28px] sm:p-5 xl:right-auto xl:max-w-[70%]">
        <div className="flex items-center gap-3">
          <div
            className={[
              "rounded-2xl p-2",
              status.isCorrectForm
                ? "bg-emerald-400/[0.15] text-emerald-200"
                : "bg-rose-400/[0.15] text-rose-200",
            ].join(" ")}
          >
            <StatusIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-cyan-100/70">
              Live Feedback
            </p>
            <p className="mt-1 font-semibold text-white">{statusLabel}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-200 sm:leading-7">{status.feedback}</p>
        <div className="mt-4 flex items-center justify-between gap-4 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
          <span>Rolling average</span>
          <span>{Math.round(status.averageAccuracy)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/[0.12]">
          <div
            className="h-full rounded-full bg-[#ffd84d] transition-all duration-500"
            style={{ width: `${Math.max(6, status.averageAccuracy)}%` }}
          />
        </div>
      </div>
    </>
  );
};
