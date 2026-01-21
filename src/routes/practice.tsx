import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { Settings, StudyPlan } from "../types";
import { callTutor, normalizePlan } from "../utils/ai";

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Dutch (nl-NL)",
};

function PracticePage() {
  const [settings] = useLocalStorage<Settings>(
    "dutch.settings",
    defaultSettings,
  );
  const [plan, setPlan] = useLocalStorage<StudyPlan>("dutch.plan", demoPlan);
  const [status, setStatus] = useState(
    "Data is stored locally in your browser.",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleGeneratePlan = async () => {
    setBusy(true);
    setError(null);
    setStatus("Calling the model for a fresh plan...");
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "You are a concise language tutor creating compact study plans. Respond with pure JSON, no markdown.",
          },
          {
            role: "user",
            content: `Goal: ${localStorage.getItem("dutch.goal")}. Native language: ${settings.userLanguage}. Target: ${settings.targetLanguage}. Write all fields (title, steps, summaries, basics, exercises, notes) in ${settings.userLanguage} except the target-language sentence text (use the 'dutch' field), which must stay in ${settings.targetLanguage}. Output JSON with keys: title, steps (array), lessons (array). Each lesson needs: id, title, topic, summary, basics (array of 3 points), sentences (3 items with dutch text in ${settings.targetLanguage}, translation in ${settings.userLanguage}, phonetic), exercises (2 items with type, prompt, options?, answer?). Keep it short and classroom-ready.`,
          },
        ],
        settings,
      );
      const updatedPlan = normalizePlan(content, demoPlan);
      setPlan(updatedPlan);
      setStatus("Plan updated with AI output and saved locally.");
      setError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reach the model.";
      setStatus(message);
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Lessons
          </p>
          <h1 className="text-2xl font-bold">
            Practice with audio, phonetics, and drills
          </h1>
          <p className="text-slate-300">{status}</p>
          {error ? (
            <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px]"
            onClick={() => setPlan(demoPlan)}
            disabled={busy}
          >
            Load demo lessons
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-white font-semibold shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGeneratePlan}
            disabled={busy}
          >
            {busy ? "Working..." : "Refresh with AI"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plan.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow transition hover:border-emerald-400/30"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Lesson {index + 1}
            </p>
            <h3 className="text-xl font-semibold text-slate-50">
              {lesson.title}
            </h3>
            <p className="text-slate-300">{lesson.summary}</p>
            <p className="text-sm text-slate-400 mt-1">
              {lesson.exercises.length} exercises • {lesson.sentences.length}{" "}
              sentences
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/practice/$lessonId"
                params={{ lessonId: String(index + 1) }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:translate-y-[-1px]"
              >
                Open practice →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PracticePage };
