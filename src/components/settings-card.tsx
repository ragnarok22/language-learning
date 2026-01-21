import type { Settings, StudyPlan } from "../types";

type Props = {
  settings: Settings;
  setSettings: (value: Settings) => void;
  plan: StudyPlan;
  showKey: boolean;
  setShowKey: (value: boolean) => void;
};

export function SettingsCard({
  settings,
  setSettings,
  plan,
  showKey,
  setShowKey,
}: Props) {
  const chipButton =
    "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold";

  const inputClass =
    "rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-50 outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Setup
          </p>
          <h2 className="text-xl font-bold">Model & language settings</h2>
          <p className="text-slate-300">
            Stored in localStorage. Pick your model and languages.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
          {`${plan.lessons.length} lessons • ${plan.steps.length} steps`}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>API key</span>
          <div className="flex items-center gap-2">
            <input
              type={showKey ? "text" : "password"}
              placeholder="sk-..."
              value={settings.apiKey}
              onChange={(e) =>
                setSettings({ ...settings, apiKey: e.target.value })
              }
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              className={chipButton}
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>Model</span>
          <input
            type="text"
            value={settings.model}
            onChange={(e) =>
              setSettings({ ...settings, model: e.target.value })
            }
            placeholder="gpt-4o-mini or other compatible model"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>Base URL</span>
          <input
            type="text"
            value={settings.baseUrl}
            onChange={(e) =>
              setSettings({ ...settings, baseUrl: e.target.value })
            }
            placeholder="https://api.openai.com/v1/chat/completions"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>Your language</span>
          <input
            type="text"
            value={settings.userLanguage}
            onChange={(e) =>
              setSettings({ ...settings, userLanguage: e.target.value })
            }
            placeholder="English, Spanish, ..."
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>Learning language</span>
          <input
            type="text"
            value={settings.targetLanguage}
            onChange={(e) =>
              setSettings({ ...settings, targetLanguage: e.target.value })
            }
            placeholder="Dutch (nl-NL)"
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}
