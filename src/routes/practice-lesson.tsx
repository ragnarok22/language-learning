import { useParams, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LessonCard } from "../components/lesson-card";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import { callTutor } from "../utils/ai";
import { getVoiceForLanguage } from "../utils/speech";
import type { Exercise, Settings, StudyPlan } from "../types";

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
  const [plan, setPlan] = useLocalStorage<StudyPlan>("dutch.plan", demoPlan);
  const [status, setStatus] = useState(
    "Data is stored locally in your browser.",
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionExplanation, setActionExplanation] = useState<string | null>(
    null,
  );
  const [actionBusy, setActionBusy] = useState(false);
  const [isAddingExercises, setIsAddingExercises] = useState(false);
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

  const mapExercise = (raw: Partial<Exercise>, index: number): Exercise => ({
    type: (raw.type as Exercise["type"]) ?? "cards",
    prompt: raw.prompt ?? `Practice item ${index + 1}`,
    options: raw.options?.map((opt) => String(opt)),
    answer: raw.answer,
  });

  const parseExercises = (content: string) => {
    try {
      const stripped = content
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const start = stripped.indexOf("[");
      const end = stripped.lastIndexOf("]");
      const candidate =
        start !== -1 && end !== -1 ? stripped.slice(start, end + 1) : stripped;
      return JSON.parse(candidate);
    } catch (error) {
      console.error("Failed to parse exercises", error);
      throw new Error("Model response was not valid JSON exercises.");
    }
  };

  const addMoreExercises = async () => {
    if (actionBusy) return;
    const lesson = plan.lessons[currentIndex];
    if (!lesson) return;
    setActionBusy(true);
    setIsAddingExercises(true);
    setActionError(null);
    setActionMessage("Generating more exercises...");
    setActionExplanation(null);
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "You are a concise language tutor. Respond with JSON only: an array of 2-3 exercises. Each exercise has: type ('cards' | 'fill' | 'order' | 'match'), prompt (string), options? (array), answer? (string). Keep prompts short and relevant to the lesson.",
          },
          {
            role: "user",
            content: `Target language: ${settings.targetLanguage}. Learner language: ${settings.userLanguage}. Lesson topic: ${lesson.title} (${lesson.topic}). Basics: ${lesson.basics.join("; ")}. Sentences: ${lesson.sentences
              .map((s) => s.dutch)
              .join(" | ")}. Return only JSON array of new exercises.`,
          },
        ],
        settings,
      );
      const parsed = parseExercises(content);
      const newExercises = Array.isArray(parsed)
        ? parsed
            .map((item, idx) => mapExercise(item as Partial<Exercise>, idx))
            .filter(Boolean)
        : [];
      if (!newExercises.length) {
        throw new Error("Model returned no exercises.");
      }
      const basePlan = plan ?? demoPlan;
      const lessons = [...basePlan.lessons];
      const targetLesson = lessons[currentIndex] ?? lessons[0];
      if (!targetLesson) {
        throw new Error("No lesson found to update.");
      }
      const updatedLesson: typeof targetLesson = {
        ...targetLesson,
        exercises: [...targetLesson.exercises, ...newExercises],
      };
      lessons[currentIndex] = updatedLesson;
      setPlan({
        ...basePlan,
        lessons,
      });
      setActionMessage(`Added ${newExercises.length} exercises.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate exercises.";
      setActionError(message);
      setActionMessage(null);
    } finally {
      setActionBusy(false);
      setIsAddingExercises(false);
    }
  };

  const explainLesson = async () => {
    if (actionBusy) return;
    const lesson = plan.lessons[currentIndex];
    if (!lesson) return;
    setActionBusy(true);
    setActionError(null);
    setActionExplanation(null);
    setActionMessage("Asking the tutor to explain this lesson...");
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "Explain the lesson clearly for a learner. Keep it under 120 words. Use the learner's language. Highlight tricky points. Respond with plain text only.",
          },
          {
            role: "user",
            content: `Learner language: ${settings.userLanguage}. Target: ${settings.targetLanguage}. Lesson: ${lesson.title} (${lesson.topic}). Summary: ${lesson.summary}. Basics: ${lesson.basics.join("; ")}. Sentences: ${lesson.sentences
              .map((s) => `${s.dutch} (${s.translation})`)
              .join(" | ")}.`,
          },
        ],
        settings,
      );
      setActionExplanation(content.trim());
      setActionMessage("Lesson explanation ready.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to explain the lesson.";
      setActionError(message);
      setActionMessage(null);
    } finally {
      setActionBusy(false);
    }
  };

  const speak = (text: string) => {
    if (!speechSupported) {
      setStatus("Speech synthesis is not available in this browser.");
      return;
    }
    const voice = getVoiceForLanguage(settings.targetLanguage);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      const match = settings.targetLanguage.match(/\(([a-z0-9-]+)\)/i);
      utterance.lang = match?.[1] ?? settings.targetLanguage;
    }
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
          {actionMessage ? (
            <p className="text-sm text-emerald-200">{actionMessage}</p>
          ) : null}
          {actionError ? (
            <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
              {actionError}
            </div>
          ) : null}
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

      {actionExplanation ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Lesson explanation
          </div>
          <p className="mt-1 leading-relaxed">{actionExplanation}</p>
        </div>
      ) : null}

      <LessonCard
        lesson={lesson}
        onSpeak={speak}
        speechSupported={speechSupported}
        onExplainLesson={explainLesson}
        onRequestMoreExercises={addMoreExercises}
        actionsDisabled={actionBusy}
        showExerciseSkeleton={isAddingExercises}
      />
    </div>
  );
}
