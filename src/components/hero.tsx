type Props = {
  status: string;
};

export function Hero({ status }: Props) {
  return (
    <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-700/20 via-sky-700/10 to-transparent px-6 py-7 shadow-2xl backdrop-blur">
      <div className="text-xs uppercase tracking-[0.3em] text-slate-300">
        Local-first language coach
      </div>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        Build your language routine with AI
      </h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Set your goal, drop in an API key, and let the browser craft lessons,
        phonetics, audio, and drills. Nothing leaves your device.
      </p>
      <div className="mt-4">
        <span className="text-sm text-slate-300">{status}</span>
      </div>
    </header>
  );
}
