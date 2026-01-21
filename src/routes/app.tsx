import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GoalCard } from "../components/goal-card";
import { Hero } from "@/components/hero";
import { LessonCard } from "../components/lesson-card";
import { PlanOverview } from "../components/plan-overview";
import { SettingsCard } from "../components/settings-card";
import { Stepper } from "../components/stepper";
import { SoonerStack } from "../components/sooner";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useSooner } from "../hooks/use-sooner";
import { callTutor, normalizePlan } from "../utils/ai";
import { getVoiceForLanguage } from "../utils/speech";
import type { Settings, StudyPlan } from "../types";

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Dutch (nl-NL)",
};

export function AppPage() {
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { items: sooners, push, dismiss } = useSooner();

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
  }, []);

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
            content: `Goal: ${goal}. Native language: ${settings.userLanguage}. Target: ${settings.targetLanguage}. Write all fields (title, steps, summaries, basics, exercises, notes) in ${settings.userLanguage} except the target-language sentence text (use the 'dutch' field), which must stay in ${settings.targetLanguage}. Output JSON with keys: title, steps (array), lessons (array). Each lesson needs: id, title, topic, summary, basics (array of 3 points), sentences (3 items with dutch text in ${settings.targetLanguage}, translation in ${settings.userLanguage}, phonetic), exercises (2 items with type, prompt, options?, answer?). Keep it short and classroom-ready.`,
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
      push(message, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setGoal("Reach conversational B1 for daily life in the Netherlands.");
    setPlan(demoPlan);
    setStatus("Reset to demo data. Your inputs remain local.");
    setError(null);
    setCurrentStep(0);
  };

  const steps = [
    { title: "Setup", description: "API key, model, and languages." },
    {
      title: "Goal",
      description: "Describe what you need your target language for.",
    },
    { title: "Plan", description: "Generate a study path with AI." },
    { title: "Practice", description: "Listen, read, and drill lessons." },
  ];

  const goNext = () =>
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((step) => Math.max(step - 1, 0));

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 text-slate-50 md:py-10">
      <Hero
        onGenerate={handleGeneratePlan}
        onReset={handleReset}
        status={status}
        busy={busy}
      />
      <SoonerStack items={sooners} onDismiss={dismiss} />

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onSelect={setCurrentStep}
          />
          <Link
            to="/practice"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:translate-y-[-1px]"
          >
            Go to practice →
          </Link>
        </div>

        {currentStep === 0 ? (
          <SettingsCard
            settings={settings}
            setSettings={setSettings}
            plan={plan}
            showKey={showKey}
            setShowKey={setShowKey}
          />
        ) : null}

        {currentStep === 1 ? (
          <GoalCard
            goal={goal}
            setGoal={setGoal}
            onRestoreDemo={() => setPlan(demoPlan)}
            plan={plan}
          />
        ) : null}

        {currentStep === 2 ? (
          <PlanOverview
            plan={plan}
            onGenerate={handleGeneratePlan}
            onLoadDemo={() => setPlan(demoPlan)}
            onNext={goNext}
            busy={busy}
            status={status}
          />
        ) : null}

        {currentStep === 3 ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  Lessons preview
                </p>
                <h2 className="text-2xl font-bold">
                  Practice with audio, phonetics, and drills
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px]"
                  onClick={() => setPlan(demoPlan)}
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
              {plan.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onSpeak={speak}
                  speechSupported={speechSupported}
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="text-sm text-slate-300">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </div>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold text-slate-100 transition hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={goPrev}
              disabled={currentStep === 0}
            >
              ← Back
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-white font-semibold shadow-lg transition hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={goNext}
              disabled={currentStep === steps.length - 1}
            >
              {currentStep === steps.length - 1 ? "You're set" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
