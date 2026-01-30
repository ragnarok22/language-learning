import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoalCard } from "../components/goal-card";
import { PlanOverview } from "../components/plan-overview";
import { SettingsCard } from "../components/settings-card";
import { demoPlan } from "../data/demo-plan";
import { useLocalStorage } from "../hooks/use-local-storage";
import { ToastStack } from "../components/toast";
import { useToast } from "../hooks/use-toast";
import type { Settings, StudyPlan } from "../types";
import { callTutor, normalizePlan } from "../utils/ai";
import { STORAGE_KEYS, defaultSettings } from "../lib/constants";

function SetupPage() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.SETTINGS,
    defaultSettings,
  );
  const [goal, setGoal] = useLocalStorage(
    STORAGE_KEYS.GOAL,
    "Reach conversational B1 level.",
  );
  const [plan, setPlan] = useLocalStorage<StudyPlan>(
    STORAGE_KEYS.PLAN,
    demoPlan,
  );
  const [status, setStatus] = useState(
    "Data is stored locally in your browser.",
  );
  const [, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [step, setStep] = useState(0);
  const { items: toasts, push, dismiss } = useToast();
  const navigate = useNavigate();

  const handleGeneratePlan = async () => {
    if (!settings.apiKey) {
      const msg = "Please enter your API key in the Setup step first.";
      setError(msg);
      push(msg, "error");
      return;
    }

    if (
      plan !== demoPlan &&
      !window.confirm("This will overwrite your current plan. Continue?")
    ) {
      return;
    }

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
            content: `Goal: ${goal}. Native language: ${settings.userLanguage}. Target: ${settings.targetLanguage}. Write all fields (title, steps, summaries, basics, exercises, notes) in ${settings.userLanguage} except the target-language sentence text (use the 'target' field), which must stay in ${settings.targetLanguage}. Output JSON with keys: title, steps (array), lessons (array). Each lesson needs: id, title, topic, summary, basics (array of 3 points), sentences (3 items with target text in ${settings.targetLanguage}, translation in ${settings.userLanguage}, phonetic), exercises (2 items with type, prompt, options?, answer?). Keep it short and classroom-ready.`,
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
          onNext={() => navigate({ to: "/practice" })}
          busy={busy}
          status={status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ToastStack items={toasts} onDismiss={dismiss} />
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
