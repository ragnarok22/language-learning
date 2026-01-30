import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/use-local-storage";
import type { Settings } from "../types";

export function RequireApiKey({ children }: { children: ReactNode }) {
  const [settings] = useLocalStorage<Settings>("ll.settings", {
    apiKey: "",
    model: "",
    baseUrl: "",
    userLanguage: "",
    targetLanguage: "",
  });

  if (!settings.apiKey) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <h2 className="mb-2 text-2xl font-bold text-slate-100">
          Setup Required
        </h2>
        <p className="mb-6 max-w-md text-slate-300">
          You need to configure your API key before you can practice or generate
          plans. Data is stored locally on your device.
        </p>
        <Link
          to="/setup"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400"
        >
          Go to Setup
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
