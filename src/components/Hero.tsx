type Props = {
  onGenerate: () => void;
  onReset: () => void;
  status: string;
  busy: boolean;
};

export function Hero({ onGenerate, onReset, status, busy }: Props) {
  const primaryButton =
    "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-white font-semibold shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed";
  const ghostButton =
    "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px]";

  return (
    <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-700/20 via-sky-700/10 to-transparent px-6 py-7 shadow-2xl backdrop-blur">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-300">
        Local-first Dutch coach
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        Build your Dutch routine with AI
      </h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Set your goal, drop in an API key, and let the browser craft lessons,
        phonetics, audio, and drills. Nothing leaves your device.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className={primaryButton} onClick={onGenerate} disabled={busy}>
          {busy ? "Generating..." : "Generate new plan"}
        </button>
        <button className={ghostButton} onClick={onReset} disabled={busy}>
          Use demo data
        </button>
        <span className="text-sm text-slate-300">{status}</span>
      </div>
    </header>
  );
}
