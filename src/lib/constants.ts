import type { Settings, TtsVoice } from "../types";

export const STORAGE_KEYS = {
  SETTINGS: "ll.settings",
  GOAL: "ll.goal",
  PLAN: "ll.plan",
  AUDIO_SENTENCES: "ll.audio-sentences",
} as const;

export const TTS_VOICES: { label: string; value: TtsVoice }[] = [
  { label: "Alloy", value: "alloy" },
  { label: "Echo", value: "echo" },
  { label: "Fable", value: "fable" },
  { label: "Onyx", value: "onyx" },
  { label: "Nova", value: "nova" },
  { label: "Shimmer", value: "shimmer" },
];

export const TTS_DEFAULTS = {
  model: "tts-1",
  voice: "nova" as TtsVoice,
  normalSpeed: 1.0,
  slowSpeed: 0.7,
} as const;

export const SUPPORTED_LANGUAGES = [
  { label: "English", value: "English" },
  { label: "Spanish (Spain)", value: "Spanish (es-ES)" },
  { label: "Spanish (Mexico)", value: "Spanish (es-MX)" },
  { label: "French", value: "French (fr-FR)" },
  { label: "German", value: "German (de-DE)" },
  { label: "Italian", value: "Italian (it-IT)" },
  { label: "Portuguese (Brazil)", value: "Portuguese (pt-BR)" },
  { label: "Portuguese (Portugal)", value: "Portuguese (pt-PT)" },
  { label: "Dutch", value: "Dutch (nl-NL)" },
  { label: "Japanese", value: "Japanese (ja-JP)" },
  { label: "Korean", value: "Korean (ko-KR)" },
  { label: "Chinese (Simplified)", value: "Chinese (zh-CN)" },
  { label: "Russian", value: "Russian (ru-RU)" },
] as const;

export const defaultSettings: Settings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  userLanguage: "English",
  targetLanguage: "Spanish (es-ES)",
};
