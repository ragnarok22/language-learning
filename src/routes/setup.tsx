import { useState } from "react";
import { GoalCard } from "../components/goal-card";
import { PlanOverview } from "../components/plan-overview";
import { SettingsCard } from "../components/settings-card";
import { SoonerStack } from "../components/sooner";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useSooner } from "../hooks/use-sooner";
import type { Settings, StudyPlan } from "../types";
import { callTutor, normalizePlan } from "../utils/ai";

const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Dutch (nl-NL)",
};

function SetupPage() {
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
  const [step, setStep] = useState(0);
  const { items: sooners, push, dismiss } = useSooner();

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

  const sections = [
    {
      title: "Setup",
      element: (
        <SettingsCard
          settings={settings}
          setSettings={setSettings}
          plan={plan}
          showKey={showKey}
          setShowKey={setShowKey}
        />
      ),
    },
    {
      title: "Goal",
      element: (
        <GoalCard
          goal={goal}
          setGoal={setGoal}
          onRestoreDemo={() => setPlan(demoPlan)}
          plan={plan}
        />
      ),
    },
    {
      title: "Plan",
      element: (
        <PlanOverview
          plan={plan}
          onGenerate={handleGeneratePlan}
          onLoadDemo={() => setPlan(demoPlan)}
          onNext={() => setStep(0)}
          busy={busy}
          status={status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SoonerStack items={sooners} onDismiss={dismiss} />
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow">
        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
          Setup flow
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => setStep(index)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                step === index
                  ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-slate-100 hover:border-white/20"
              }`}
            >
              {index + 1}. {section.title}
            </button>
          ))}
        </div>
      </div>

      {sections[step].element}
    </div>
  );
}

export { SetupPage };
