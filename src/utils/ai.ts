import type { Exercise, Lesson, Sentence, Settings, StudyPlan } from "../types";

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part === "object" && part && "text" in part) {
          const text = (part as { text?: string }).text;
          return text ?? "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

export async function callTutor(
  messages: { role: "system" | "user"; content: string }[],
  settings: Settings,
) {
  if (!settings.apiKey?.trim()) {
    throw new Error("API Key is missing. Please add it in the Setup tab.");
  }

  const response = await fetch(settings.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.7,
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Model request failed: ${response.status}`;
    try {
      const errorJson = JSON.parse(text);
      if (errorJson.error?.message) {
        message += ` - ${errorJson.error.message}`;
      } else {
        message += ` ${text}`;
      }
    } catch {
      message += ` ${text}`;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const content = extractTextContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error("Model response was empty. Check the model and try again.");
  }
  return content;
}

export function normalizePlan(raw: unknown, fallback: StudyPlan): StudyPlan {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object") return fallback;
    const base = parsed as Partial<StudyPlan>;

    const lessons: Lesson[] = Array.isArray(base.lessons)
      ? base.lessons.map((lesson, index) => {
          const safeLesson = lesson as Partial<Lesson>;
          return {
            id: safeLesson.id ?? `lesson-${index + 1}`,
            title: safeLesson.title ?? "Nieuw onderwerp",
            topic: safeLesson.topic ?? "Taal",
            summary: safeLesson.summary ?? "Leer de kern van het onderwerp.",
            basics: Array.isArray(safeLesson.basics)
              ? safeLesson.basics.map((item) => String(item))
              : ["Belangrijke punten voor dit onderdeel."],
            sentences: Array.isArray(safeLesson.sentences)
              ? safeLesson.sentences.map((sentence) => {
                  const s = sentence as Partial<Sentence>;
                  return {
                    target: s.target ?? "Target sentence missing.",
                    translation: s.translation ?? "Translation missing.",
                    phonetic: s.phonetic,
                    note: s.note,
                  };
                })
              : [],
            exercises: Array.isArray(safeLesson.exercises)
              ? safeLesson.exercises.map((exercise) => {
                  const e = exercise as Partial<Exercise>;
                  return {
                    type: (e.type as Exercise["type"]) ?? "cards",
                    prompt: e.prompt ?? "Kies het juiste antwoord.",
                    options: e.options?.map((opt) => String(opt)),
                    answer: e.answer,
                  };
                })
              : [],
          };
        })
      : fallback.lessons;

    return {
      title: base.title ?? fallback.title,
      steps: Array.isArray(base.steps)
        ? base.steps.map((step) => String(step))
        : fallback.steps,
      lessons,
    };
  } catch (error) {
    console.error("Plan parse failed. Raw input:", raw, "Error:", error);
    return fallback;
  }
}
