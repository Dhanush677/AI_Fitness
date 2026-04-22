import { ArrowRight, type LucideIcon } from "lucide-react";

type ExerciseCardProps = {
  title: string;
  description: string;
  cue: string;
  focus: string;
  icon: LucideIcon;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export const ExerciseCard = ({
  title,
  description,
  cue,
  focus,
  icon: Icon,
  selected,
  disabled = false,
  onSelect,
}: ExerciseCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={[
        "interactive-card group relative w-full overflow-hidden rounded-[30px] border p-5 text-left",
        selected
          ? "border-cyan-100/75 bg-gradient-to-br from-cyan-200 via-sky-300 to-cyan-400 text-slate-950 shadow-[0_26px_60px_rgba(34,211,238,0.26)]"
          : "border-white/[0.12] bg-gradient-to-br from-[#5be4ff] via-[#35c7f0] to-[#1497d9] text-slate-950 shadow-[0_22px_45px_rgba(13,28,52,0.22)]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_28%)] opacity-80" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd84d] text-slate-950 shadow-[0_12px_22px_rgba(255,216,77,0.28)]">
          <Icon className="h-6 w-6" />
        </div>
        <span
          className={[
            "rounded-full border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.26em]",
            selected
              ? "border-slate-950/[0.12] bg-slate-950/[0.12] text-slate-950"
              : "border-slate-950/10 bg-white/30 text-slate-950/80",
          ].join(" ")}
        >
          {selected ? "Armed" : "Select"}
        </span>
      </div>

      <div className="relative mt-5">
        <h3 className="font-display text-2xl text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-950/[0.78]">{description}</p>
      </div>

      <div className="relative mt-5 rounded-[24px] border border-slate-950/10 bg-white/[0.28] p-4 backdrop-blur-md">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-950/[0.55]">
          Tracking Focus
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-950">{focus}</p>
        <p className="mt-3 text-sm leading-6 text-slate-950/[0.75]">{cue}</p>
      </div>

      <div className="relative mt-5 flex items-center justify-between text-sm font-semibold text-slate-950">
        <span>Ready for live coaching</span>
        <span className="inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
          Open
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
};
