export type Sentence = {
  target: string;
  translation: string;
  phonetic?: string;
  note?: string;
};

export type Exercise = {
  type: "cards" | "fill" | "order" | "match";
  prompt: string;
  options?: string[];
  answer?: string;
};

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  basics: string[];
  sentences: Sentence[];
  exercises: Exercise[];
};

export type StudyPlan = {
  title: string;
  steps: string[];
  lessons: Lesson[];
};

export type Settings = {
  apiKey: string;
  model: string;
  baseUrl: string;
  userLanguage: string;
  targetLanguage: string;
};

export type AudioPracticeSentence = Sentence & {
  id: string;
};

export type TtsVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
