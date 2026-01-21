import { useParams, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LessonCard } from "../components/lesson-card";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { Settings, StudyPlan } from "../types";

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Dutch (nl-NL)",
};

export function PracticeLessonPage() {
  const params = useParams({ from: "/practice/$lessonId" });
  const [settings] = useLocalStorage<Settings>(
    "dutch.settings",
    defaultSettings,
  );
  const [plan] = useLocalStorage<StudyPlan>("dutch.plan", demoPlan);
  const [status, setStatus] = useState(
    "Data is stored locally in your browser.",
  );
  const [speechSupported] = useState(
    typeof window !== "undefined" && "speechSynthesis" in window,
  );

  const currentIndex = useMemo(
    () => Math.max(0, Number(params.lessonId ?? "1") - 1),
    [params.lessonId],
  );
  const lesson = useMemo(() => {
    return plan.lessons[currentIndex] ?? plan.lessons[0];
  }, [currentIndex, plan.lessons]);
  const hasNext =
    plan.lessons.length > 0 && currentIndex < plan.lessons.length - 1;
  const nextIndex = Math.min(plan.lessons.length - 1, currentIndex + 1);

  const speak = (text: string) => {
    if (!speechSupported) {
      setStatus("Speech synthesis is not available in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.targetLanguage.toLowerCase().includes("nl")
      ? "nl-NL"
      : "nl-NL";
    utterance.voice =
      speechSynthesis.getVoices().find((v) => v.lang === utterance.lang) ||
      speechSynthesis.getVoices()[0];
    utterance.rate = 1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Lesson
          </p>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <p className="text-slate-300">{lesson.summary}</p>
          <p className="text-sm text-slate-400">{status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:translate-y-[-1px]"
          >
            ← Back to lessons
          </Link>
          {hasNext ? (
            <Link
              to="/practice/$lessonId"
              params={{ lessonId: String(nextIndex + 1) }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:translate-y-[-1px]"
            >
              Next lesson →
            </Link>
          ) : null}
        </div>
      </div>

      <LessonCard
        lesson={lesson}
        onSpeak={speak}
        speechSupported={speechSupported}
      />
    </div>
  );
}
