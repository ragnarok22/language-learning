import { Link } from "@tanstack/react-router";
import { Hero } from "@/components/hero";
import { demoPlan } from "../data/demo-plan";

function Landing() {
  return (
    <div className="space-y-6">
      <Hero status="Everything stays in your browser." />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
          Start
        </p>
        <h2 className="text-2xl font-bold">Choose where to begin</h2>
        <p className="text-slate-300">
          Draft a plan, set your goals, and practice lessons with local-only
          storage.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {/* Old full flow removed */}
          <Card
            title="Setup & plan"
            body="Jump to settings and plan creation."
            cta="Go to setup"
            to="/setup"
          />
          <Card
            title="Practice lessons"
            body={`Browse ${demoPlan.lessons.length} demo lessons with audio.`}
            cta="Practice"
            to="/practice"
          />
          <Card
            title="Audio practice"
            body="AI-generated sentence pronunciation with OpenAI TTS."
            cta="Audio practice"
            to="/audio-practice"
          />
        </div>
      </div>
    </div>
  );
}

type CardProps = { title: string; body: string; cta: string; to: string };
function Card({ title, body, cta, to }: CardProps) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow transition hover:border-emerald-400/40 hover:translate-y-[-1px]"
    >
      <div className="text-sm uppercase tracking-[0.25em] text-slate-400">
        {title}
      </div>
      <p className="mt-2 text-slate-200">{body}</p>
      <div className="mt-3 inline-flex items-center gap-2 text-emerald-200">
        {cta} →
      </div>
    </Link>
  );
}

export { Landing };
