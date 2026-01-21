import { useState } from "react";
import type { Lesson } from "../types";

type Props = {
  lesson: Lesson;
  onSpeak: (text: string) => void;
  speechSupported: boolean;
  onRequestMoreExercises?: (lesson: Lesson) => void;
  onExplainLesson?: (lesson: Lesson) => void;
  actionsDisabled?: boolean;
  showExerciseSkeleton?: boolean;
};

export function LessonCard({
  lesson,
  onSpeak,
  speechSupported,
  onRequestMoreExercises,
  onExplainLesson,
  actionsDisabled,
  showExerciseSkeleton,
}: Props) {
  const chipButton =
    "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold";
  const optionBase =
    "rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-emerald-300/50";

  const [selected, setSelected] = useState<Record<number, string | null>>({});
  const [result, setResult] = useState<
    Record<number, "correct" | "wrong" | null>
  >({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const handleSelect = (
    exerciseIndex: number,
    option: string,
    answer?: string,
  ) => {
    const isCorrect =
      answer && option.trim().toLowerCase() === answer.trim().toLowerCase();
    setSelected((prev) => ({ ...prev, [exerciseIndex]: option }));
    setResult((prev) => ({
      ...prev,
      [exerciseIndex]: isCorrect ? "correct" : "wrong",
    }));
  };

  const toggleReveal = (exerciseIndex: number) => {
    setRevealed((prev) => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex],
    }));
  };

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            {lesson.topic}
          </p>
          <h3 className="text-xl font-semibold">{lesson.title}</h3>
          <p className="text-slate-300">{lesson.summary}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200">
          {lesson.basics.length} basics
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Lesson content
          </p>
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Basics
            </p>
            <ul className="mt-2 space-y-2 text-slate-100">
              {lesson.basics.map((item, index) => (
                <li key={index} className="list-disc pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Sentences
            </p>
            <div className="mt-2 space-y-3">
              {lesson.sentences.map((sentence, index) => (
                <div
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-3"
                  key={index}
                >
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-white">
                      {sentence.dutch}
                    </div>
                    <div className="text-sm text-slate-300">
                      {sentence.translation}
                    </div>
                    {sentence.phonetic ? (
                      <div className="text-sm font-mono text-emerald-200">
                        {sentence.phonetic}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={chipButton}
                      onClick={() => onSpeak(sentence.dutch)}
                      disabled={!speechSupported}
                    >
                      {speechSupported ? "Play audio" : "Audio unavailable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Exercises
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                className={chipButton}
                type="button"
                onClick={() => onExplainLesson?.(lesson)}
                disabled={actionsDisabled}
              >
                Explain lesson
              </button>
              <button
                className={chipButton}
                type="button"
                onClick={() => onRequestMoreExercises?.(lesson)}
                disabled={actionsDisabled}
              >
                Add more exercises
              </button>
            </div>
          </div>

          {showExerciseSkeleton ? (
            <div className="mt-2 space-y-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-white/10"></div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-white/10"></div>
                  <div className="h-3 w-4/5 animate-pulse rounded bg-white/10"></div>
                  <div className="h-3 w-3/5 animate-pulse rounded bg-white/10"></div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={`mt-2 space-y-2 ${showExerciseSkeleton ? "opacity-60 pointer-events-none" : ""}`}
          >
            {lesson.exercises.map((exercise, index) => {
              const answer = exercise.answer ?? "";
              const state = result[index];
              const isRevealed = revealed[index];
              return (
                <div
                  className="space-y-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-3 transition hover:-translate-y-0.5 hover:border-emerald-300/50"
                  key={index}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold lowercase text-sky-200">
                        {exercise.type}
                      </span>
                      <p className="mt-1 text-slate-100">{exercise.prompt}</p>
                    </div>
                    {exercise.answer ? (
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5"
                        onClick={() => toggleReveal(index)}
                        type="button"
                      >
                        {isRevealed ? "Hide answer" : "Reveal answer"}
                      </button>
                    ) : null}
                  </div>

                  {exercise.options ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exercise.options.map((option) => {
                        const isSelected = selected[index] === option;
                        const isCorrect = isSelected && state === "correct";
                        const isWrong = isSelected && state === "wrong";
                        const optionClasses = [
                          optionBase,
                          isCorrect &&
                            "border-emerald-400/70 bg-emerald-500/20 text-emerald-50",
                          isWrong &&
                            "border-rose-400/70 bg-rose-500/10 text-rose-50",
                          isSelected && !state && "border-white/40 bg-white/15",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <button
                            key={option}
                            className={optionClasses}
                            onClick={() => handleSelect(index, option, answer)}
                            type="button"
                          >
                            <span className="flex items-center gap-2">
                              {isCorrect ? (
                                <span aria-hidden className="text-emerald-100">
                                  ✓
                                </span>
                              ) : null}
                              {isWrong ? (
                                <span aria-hidden className="text-rose-100">
                                  ✕
                                </span>
                              ) : null}
                              <span>{option}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {state ? (
                    <div
                      className={`text-sm font-semibold ${
                        state === "correct"
                          ? "text-emerald-200"
                          : "text-rose-200"
                      }`}
                    >
                      {state === "correct"
                        ? "Correct!"
                        : "Not quite—try again or reveal the answer."}
                    </div>
                  ) : null}

                  {isRevealed && exercise.answer ? (
                    <div className="text-sm text-slate-200">
                      Answer: {exercise.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
