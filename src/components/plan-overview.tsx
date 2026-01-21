import type { StudyPlan } from "../types";

type Props = {
  plan: StudyPlan;
  onGenerate: () => void;
  onLoadDemo: () => void;
  onNext: () => void;
  busy: boolean;
  status: string;
};

export function PlanOverview({
  plan,
  onGenerate,
  onLoadDemo,
  onNext,
  busy,
  status,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Plan
          </p>
          <h2 className="text-xl font-bold">Generate a study path</h2>
          <p className="text-slate-300">
            Use your goal to draft a plan, then head to practice. Demo data is
            available anytime.
          </p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200">
          {plan.title}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-white font-semibold shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onGenerate}
          disabled={busy}
        >
          {busy ? "Generating..." : "Generate / refresh with AI"}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px]"
          onClick={onLoadDemo}
          disabled={busy}
        >
          Load demo plan
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-100 transition hover:translate-y-[-1px]"
          onClick={onNext}
        >
          Continue to practice →
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-300">{status}</p>

      <div className="mt-3 space-y-2">
        {plan.steps.map((step, index) => (
          <div
            className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2"
            key={index}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-200">
              {index + 1}
            </span>
            <p className="text-slate-100">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
