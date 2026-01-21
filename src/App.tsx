import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Sentence = {
  dutch: string;
  translation: string;
  phonetic?: string;
  note?: string;
};

type Exercise = {
  type: "cards" | "fill" | "order" | "match";
  prompt: string;
  options?: string[];
  answer?: string;
};

type Lesson = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  basics: string[];
  sentences: Sentence[];
  exercises: Exercise[];
};

type StudyPlan = {
  title: string;
  steps: string[];
  lessons: Lesson[];
};

type Settings = {
  apiKey: string;
  model: string;
  baseUrl: string;
  userLanguage: string;
  targetLanguage: string;
};

const demoPlan: StudyPlan = {
  title: "Two-week Dutch warmup",
  steps: [
    "Days 1–3: nail sounds, greetings, and spelling patterns.",
    "Days 4–7: daily routines, schedules, and travel basics.",
    "Days 8–10: shops, cafés, and short service dialogues.",
    "Days 11–14: storytelling, simple past tense, and review.",
  ],
  lessons: [
    {
      id: "sounds",
      title: "Klanken & Greetings",
      topic: "Sound patterns and first impressions",
      summary:
        "Tune your ear to common vowel pairs and introduce yourself confidently.",
      basics: [
        "Short vs. long vowels (a/aa, e/ee) and the Dutch “g” (soft throat).",
        "Greetings: hoi, hallo, goedemorgen, tot ziens, doei.",
        "Small talk frames: Ik ben..., Ik kom uit..., Hoe gaat het?",
      ],
      sentences: [
        {
          dutch: "Hoi, ik ben Noor. Leuk je te ontmoeten!",
          translation: "Hi, I am Noor. Nice to meet you!",
          phonetic: "hoy, ik ben nor. leuk yuh tuh uh-moat-nuh",
        },
        {
          dutch: "Hoe gaat het met je?",
          translation: "How are you doing?",
          phonetic: "hoo ghaat hut met yuh",
        },
        {
          dutch: "Ik kom uit Spanje, en ik woon in Utrecht.",
          translation: "I come from Spain, and I live in Utrecht.",
          phonetic: "ik kom out spahn-yuh, en ik vohn in uu-trekht",
        },
      ],
      exercises: [
        {
          type: "cards",
          prompt: "Pick the way to say “See you soon”.",
          options: ["Tot snel", "Tot nooit", "Dag het gaat"],
          answer: "Tot snel",
        },
        {
          type: "fill",
          prompt: "Complete: Ik ____ uit Canada.",
          answer: "kom",
        },
      ],
    },
    {
      id: "daily-routine",
      title: "Dagelijkse routine",
      topic: "Time blocks and daily verbs",
      summary: "Talk through morning to evening and ask about someone’s plans.",
      basics: [
        "Verb order in main clauses: subject + verb + time + place + rest.",
        "Common verbs: opstaan, werken, koken, slapen, gaan.",
        "Time markers: ’s ochtends, vanmiddag, vanavond, morgen.",
      ],
      sentences: [
        {
          dutch: "Ik sta om zeven uur op en ik maak koffie.",
          translation: "I get up at seven and I make coffee.",
          phonetic: "ik staa om zay-vun uur op en ik maak kof-fee",
        },
        {
          dutch: "Werk je morgen thuis of op kantoor?",
          translation: "Are you working from home tomorrow or at the office?",
          phonetic: "verk yuh mor-ghun tuys of op kan-toor",
        },
        {
          dutch: "Na het eten ga ik wandelen met mijn hond.",
          translation: "After dinner I go for a walk with my dog.",
          phonetic: "naa hut ay-tun gaa ik van-duh-luhn met mayn hond",
        },
      ],
      exercises: [
        {
          type: "order",
          prompt: "Arrange: “ik - ga - vanavond - sporten”.",
          answer: "Ik ga vanavond sporten.",
        },
        {
          type: "cards",
          prompt: "Choose the translation for “I like to cook”.",
          options: [
            "Ik houd van koken.",
            "Ik hou van lopen.",
            "Ik ga naar koken.",
          ],
          answer: "Ik houd van koken.",
        },
      ],
    },
    {
      id: "service",
      title: "In de winkel en het café",
      topic: "Service interactions",
      summary:
        "Order food, ask for prices, and handle polite requests with u/jij forms.",
      basics: [
        "Polite forms: mag ik…?, alstublieft/alstjeblieft, dank u/je.",
        "Numbers to 100 and euro amounts.",
        "Modal verbs: kan, mag, wil for requests.",
      ],
      sentences: [
        {
          dutch: "Mag ik een cappuccino zonder suiker, alstublieft?",
          translation: "May I have a cappuccino without sugar, please?",
          phonetic: "mach ik un kap-u-chee-no zon-der sow-ker, al-stu-bleeft",
        },
        {
          dutch: "Dat kost vier euro vijftig.",
          translation: "That costs four euros fifty.",
          phonetic: "dat kost fear eu-ro fai-f-tich",
        },
        {
          dutch: "Heeft u iets vegetarisch?",
          translation: "Do you have something vegetarian?",
          phonetic: "heeft uu its vay-ghay-tar-isch",
        },
      ],
      exercises: [
        {
          type: "fill",
          prompt: "Complete: Mag ___ helpen?",
          answer: "ik u",
        },
        {
          type: "match",
          prompt:
            "Match the amount to the spoken form: €3,20 → drie euro twintig.",
        },
      ],
    },
  ],
};

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Dutch (nl-NL)",
};

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error("Local storage read failed", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Local storage write failed", error);
    }
  };

  return [storedValue, setValue];
}

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

async function callTutor(
  messages: { role: "system" | "user"; content: string }[],
  settings: Settings,
) {
  if (!settings.apiKey) {
    throw new Error("Add your API key to generate a custom plan.");
  }

  const response = await fetch(settings.baseUrl || defaultSettings.baseUrl, {
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
    const message = await response.text();
    throw new Error(`Model request failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  const content = extractTextContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error("Model response was empty. Check the model and try again.");
  }
  return content;
}

function normalizePlan(raw: unknown): StudyPlan {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object") return demoPlan;
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
                    dutch: s.dutch ?? "Voorbeeldzin ontbreekt.",
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
      : demoPlan.lessons;

    return {
      title: base.title ?? demoPlan.title,
      steps: Array.isArray(base.steps)
        ? base.steps.map((step) => String(step))
        : demoPlan.steps,
      lessons,
    };
  } catch (error) {
    console.error("Plan parse failed", error);
    return demoPlan;
  }
}

function App() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "dutch.settings",
    defaultSettings,
  );
  const [goal, setGoal] = useLocalStorage(
    "dutch.goal",
    "Reach conversational B1 for daily life in the Netherlands.",
  );
  const [plan, setPlan] = useLocalStorage<StudyPlan>("dutch.plan", demoPlan);
  const [status, setStatus] = useState(
    "Data is stored locally in your browser.",
  );
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

  const planSummary = useMemo(
    () => `${plan.lessons.length} lessons • ${plan.steps.length} steps`,
    [plan.lessons.length, plan.steps.length],
  );

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

  const handleGeneratePlan = async () => {
    setBusy(true);
    setStatus("Calling the model for a fresh plan...");
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "You are a concise Dutch tutor creating compact study plans. Respond with pure JSON, no markdown.",
          },
          {
            role: "user",
            content: `Goal: ${goal}. Native language: ${settings.userLanguage}. Target: ${settings.targetLanguage}. Output JSON with keys: title, steps (array), lessons (array). Each lesson needs: id, title, topic, summary, basics (array of 3 points), sentences (3 items with dutch, translation in ${settings.userLanguage}, phonetic), exercises (2 items with type, prompt, options?, answer?). Keep it short and classroom-ready.`,
          },
        ],
        settings,
      );
      const updatedPlan = normalizePlan(content);
      setPlan(updatedPlan);
      setStatus("Plan updated with AI output and saved locally.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to reach the model.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setGoal("Reach conversational B1 for daily life in the Netherlands.");
    setPlan(demoPlan);
    setStatus("Reset to demo data. Your inputs remain local.");
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="eyebrow">Local-first Dutch coach</div>
        <h1>Build your Dutch routine with AI</h1>
        <p className="lede">
          Set your goal, drop in an API key, and let the browser craft lessons,
          phonetics, audio, and drills. Nothing leaves your device.
        </p>
        <div className="hero-actions">
          <button
            className="primary"
            onClick={handleGeneratePlan}
            disabled={busy}
          >
            {busy ? "Generating..." : "Generate new plan"}
          </button>
          <button className="ghost" onClick={handleReset} disabled={busy}>
            Use demo data
          </button>
          <span className="status">{status}</span>
        </div>
      </header>

      <section className="grid two">
        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Setup</p>
              <h2>Model & language settings</h2>
              <p className="muted">
                Stored in localStorage. Pick your model and languages.
              </p>
            </div>
            <span className="badge">{planSummary}</span>
          </div>

          <div className="fields-grid">
            <label className="field">
              <span>API key</span>
              <div className="input-row">
                <input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, apiKey: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="chip"
                  onClick={() => setShowKey((prev) => !prev)}
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Model</span>
              <input
                type="text"
                value={settings.model}
                onChange={(e) =>
                  setSettings({ ...settings, model: e.target.value })
                }
                placeholder="gpt-4o-mini or other compatible model"
              />
            </label>

            <label className="field">
              <span>Base URL</span>
              <input
                type="text"
                value={settings.baseUrl}
                onChange={(e) =>
                  setSettings({ ...settings, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </label>

            <label className="field">
              <span>Your language</span>
              <input
                type="text"
                value={settings.userLanguage}
                onChange={(e) =>
                  setSettings({ ...settings, userLanguage: e.target.value })
                }
                placeholder="English, Spanish, ..."
              />
            </label>

            <label className="field">
              <span>Learning language</span>
              <input
                type="text"
                value={settings.targetLanguage}
                onChange={(e) =>
                  setSettings({ ...settings, targetLanguage: e.target.value })
                }
                placeholder="Dutch (nl-NL)"
              />
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Goal & plan</p>
              <h2>What do you want to achieve?</h2>
              <p className="muted">
                Describe your target; AI will draft lessons around it.
              </p>
            </div>
            <button className="ghost" onClick={() => setPlan(demoPlan)}>
              Restore example
            </button>
          </div>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="E.g., Pass the inburgering exam, feel confident in cafés, or prep for a move."
          />

          <div className="steps">
            {plan.steps.map((step, index) => (
              <div className="step" key={index}>
                <span className="step-number">{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lessons">
        <div className="section-head">
          <div>
            <p className="label">Lessons</p>
            <h2>Practice with audio, phonetics, and drills</h2>
          </div>
          <div className="section-actions">
            <button className="ghost" onClick={() => setPlan(demoPlan)}>
              Load demo lessons
            </button>
            <button
              className="primary"
              onClick={handleGeneratePlan}
              disabled={busy}
            >
              {busy ? "Working..." : "Refresh with AI"}
            </button>
          </div>
        </div>

        <div className="lesson-grid">
          {plan.lessons.map((lesson) => (
            <article className="lesson-card" key={lesson.id}>
              <div className="lesson-head">
                <div>
                  <p className="label">{lesson.topic}</p>
                  <h3>{lesson.title}</h3>
                  <p className="muted">{lesson.summary}</p>
                </div>
                <span className="badge subtle">
                  {lesson.basics.length} basics
                </span>
              </div>

              <div className="block">
                <p className="mini-label">Basics</p>
                <ul className="bullets">
                  {lesson.basics.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="block">
                <p className="mini-label">Sentences</p>
                <div className="sentences">
                  {lesson.sentences.map((sentence, index) => (
                    <div className="sentence" key={index}>
                      <div className="sentence-text">
                        <div className="dutch">{sentence.dutch}</div>
                        <div className="translation">
                          {sentence.translation}
                        </div>
                        {sentence.phonetic ? (
                          <div className="phonetic">{sentence.phonetic}</div>
                        ) : null}
                      </div>
                      <div className="sentence-actions">
                        <button
                          className="chip"
                          onClick={() => speak(sentence.dutch)}
                          disabled={!speechSupported}
                        >
                          {speechSupported ? "Play audio" : "Audio unavailable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="block">
                <p className="mini-label">Exercises</p>
                <div className="exercises">
                  {lesson.exercises.map((exercise, index) => (
                    <div className="exercise" key={index}>
                      <div>
                        <span className="pill">{exercise.type}</span>
                        <p>{exercise.prompt}</p>
                        {exercise.options ? (
                          <div className="options">
                            {exercise.options.map((option) => (
                              <span key={option} className="option-chip">
                                {option}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {exercise.answer ? (
                        <div className="answer">Answer: {exercise.answer}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
