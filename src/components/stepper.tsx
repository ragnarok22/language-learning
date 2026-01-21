type Step = {
  title: string;
  description: string;
};

type Props = {
  steps: Step[];
  currentStep: number;
  onSelect?: (index: number) => void;
};

export function Stepper({ steps, currentStep, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow">
      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onSelect?.(index)}
              className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                  : "border-white/10 bg-transparent hover:border-white/20"
              }`}
              aria-current={isActive ? "step" : undefined}
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isDone
                      ? "bg-emerald-500/70 text-white"
                      : isActive
                        ? "bg-emerald-500/30 text-white"
                        : "bg-white/10 text-slate-200"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                {step.title}
              </div>
              <p className="text-xs text-slate-300">{step.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
