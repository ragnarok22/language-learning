import type { StudyPlan } from "../types";

type Props = {
  goal: string;
  setGoal: (goal: string) => void;
  onRestoreDemo: () => void;
  plan: StudyPlan;
};

export function GoalCard({ goal, setGoal, onRestoreDemo, plan }: Props) {
  const inputClass =
    "rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-slate-50 outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Goal & plan
          </p>
          <h2 className="text-xl font-bold">What do you want to achieve?</h2>
          <p className="text-slate-300">
            Describe your target; AI will draft lessons around it.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px]"
          onClick={onRestoreDemo}
        >
          Restore example
        </button>
      </div>

      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="E.g., Pass the inburgering exam, feel confident in cafés, or prep for a move."
        className={`${inputClass} w-full`}
      />

      <div className="mt-3 space-y-2">
        {plan.steps.map((step, index) => (
          <div
            className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2"
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
