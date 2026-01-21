import type { Lesson } from "../types";

type Props = {
  lesson: Lesson;
  onSpeak: (text: string) => void;
  speechSupported: boolean;
};

export function LessonCard({ lesson, onSpeak, speechSupported }: Props) {
  const chipButton =
    "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold";

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

      <div className="border-t border-white/10 pt-3">
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

      <div className="border-t border-white/10 pt-3">
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

      <div className="border-t border-white/10 pt-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Exercises
        </p>
        <div className="mt-2 space-y-2">
          {lesson.exercises.map((exercise, index) => (
            <div
              className="space-y-2 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-3"
              key={index}
            >
              <div>
                <span className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold lowercase text-sky-200">
                  {exercise.type}
                </span>
                <p className="mt-1 text-slate-100">{exercise.prompt}</p>
                {exercise.options ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {exercise.options.map((option) => (
                      <span
                        key={option}
                        className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-100"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {exercise.answer ? (
                <div className="text-sm text-slate-300">
                  Answer: {exercise.answer}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
