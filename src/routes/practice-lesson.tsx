import { useParams, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LessonCard } from "../components/lesson-card";
import { SoonerStack, type SoonerItem } from "../components/sooner";
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
  const [sooners, setSooners] = useState<SoonerItem[]>([]);
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

  const dismissSooner = (id: number) =>
    setSooners((prev) => prev.filter((item) => item.id !== id));

  const pushSooner = (
    message: string,
    variant: SoonerItem["variant"] = "info",
    persist = false,
  ) => {
    const id = Date.now() + Math.random();
    setSooners((prev) => [...prev, { id, message, variant }]);
    if (!persist && variant !== "loading") {
      setTimeout(() => dismissSooner(id), 3200);
    }
    return id;
  };

  const updateSooner = (
    id: number,
    message: string,
    variant: SoonerItem["variant"] = "info",
  ) => {
    setSooners((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, message, variant } : item,
      ),
    );
    if (variant !== "loading") {
      setTimeout(() => dismissSooner(id), 2600);
    }
  };

  const parseExercises = (content: string) => {
    const tryParse = (text: string) => {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        if (
          parsed &&
          Array.isArray((parsed as { exercises?: unknown }).exercises)
        ) {
          return (parsed as { exercises: unknown[] }).exercises;
        }
        return null;
      } catch {
        return null;
      }
    };

    const cleaned = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const direct = tryParse(cleaned);
    if (direct) return direct;

    const bracketMatch = cleaned.match(/\[[\s\S]*\]/);
    if (bracketMatch) {
      const parsed = tryParse(bracketMatch[0]);
      if (parsed) return parsed;
    }

    const withoutFenceLines = content
      .split("\n")
      .filter((line) => !line.trim().startsWith("```"))
      .join("\n")
      .trim();
    const fallback = tryParse(withoutFenceLines);
    if (fallback) return fallback;

    console.error("Failed to parse exercises", content);
    throw new Error("Model response was not valid JSON exercises.");
  };

  const addMoreExercises = async () => {
    if (actionBusy) return;
    const lesson = plan.lessons[currentIndex];
    if (!lesson) return;
    const loadingId = pushSooner(
      "Generating more exercises...",
      "loading",
      true,
    );
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
      updateSooner(
        loadingId,
        `Added ${newExercises.length} exercises.`,
        "success",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate exercises.";
      setActionError(message);
      setActionMessage(null);
      updateSooner(loadingId, message, "error");
    } finally {
      setActionBusy(false);
      setIsAddingExercises(false);
    }
  };

  const explainLesson = async () => {
    if (actionBusy) return;
    const lesson = plan.lessons[currentIndex];
    if (!lesson) return;
    const loadingId = pushSooner("Explaining this lesson...", "loading", true);
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
      updateSooner(loadingId, "Lesson explained.", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to explain the lesson.";
      setActionError(message);
      setActionMessage(null);
      updateSooner(loadingId, message, "error");
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
      <SoonerStack items={sooners} onDismiss={dismissSooner} />
    </div>
  );
}
