import type { Settings } from "../types";

export const STORAGE_KEYS = {
  SETTINGS: "ll.settings",
  GOAL: "ll.goal",
  PLAN: "ll.plan",
} as const;

export const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Spanish (es-ES)",
};
