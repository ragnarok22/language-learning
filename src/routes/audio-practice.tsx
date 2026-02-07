import { useState } from "react";
import { RequireApiKey } from "../components/require-api-key";
import { ToastStack } from "../components/toast";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useToast } from "../hooks/use-toast";
import { useAudioPlayer } from "../hooks/use-audio-player";
import {
  STORAGE_KEYS,
  defaultSettings,
  TTS_VOICES,
  TTS_DEFAULTS,
} from "../lib/constants";
import { callTutor } from "../utils/ai";
import { generateSpeech } from "../utils/tts";
import type {
  AudioPracticeSentence,
  Settings,
  StudyPlan,
  TtsVoice,
} from "../types";

function AudioPracticePage() {
  const [settings] = useLocalStorage<Settings>(
    STORAGE_KEYS.SETTINGS,
    defaultSettings,
  );
  const [sentences, setSentences] = useLocalStorage<AudioPracticeSentence[]>(
    STORAGE_KEYS.AUDIO_SENTENCES,
    [],
  );
  const [voice, setVoice] = useState<TtsVoice>(TTS_DEFAULTS.voice);
  const [generating, setGenerating] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [adding, setAdding] = useState(false);
  const { items: toasts, push, dismiss } = useToast();

  const player = useAudioPlayer(
    settings.apiKey,
    settings.baseUrl,
    voice,
    TTS_DEFAULTS.normalSpeed,
    TTS_DEFAULTS.slowSpeed,
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "You are a language tutor. Respond with pure JSON only, no markdown.",
          },
          {
            role: "user",
            content: `Generate 5 useful practice sentences for a student learning ${settings.targetLanguage} (native: ${settings.userLanguage}). Return a JSON array where each item has: "target" (sentence in ${settings.targetLanguage}), "translation" (in ${settings.userLanguage}), "phonetic" (pronunciation guide), "note" (brief grammar/usage tip in ${settings.userLanguage}). Keep sentences practical and conversational.`,
          },
        ],
        settings,
      );

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Could not parse AI response as JSON.");
      }

      if (!Array.isArray(parsed)) {
        throw new Error("AI response was not an array.");
      }

      const newSentences: AudioPracticeSentence[] = parsed.map(
        (item: Record<string, unknown>) => ({
          id: crypto.randomUUID(),
          target: String(item.target ?? ""),
          translation: String(item.translation ?? ""),
          phonetic: item.phonetic ? String(item.phonetic) : undefined,
          note: item.note ? String(item.note) : undefined,
        }),
      );

      setSentences([...sentences, ...newSentences]);
      push(`Added ${newSentences.length} sentences`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed.";
      push(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleImportFromPlan = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLAN);
      if (!raw) {
        push("No study plan found. Create one in Setup first.", "error");
        return;
      }
      const plan = JSON.parse(raw) as StudyPlan;
      const imported: AudioPracticeSentence[] = plan.lessons.flatMap((lesson) =>
        lesson.sentences.map((s) => ({
          ...s,
          id: crypto.randomUUID(),
        })),
      );
      if (imported.length === 0) {
        push("Plan has no sentences to import.", "error");
        return;
      }
      setSentences([...sentences, ...imported]);
      push(`Imported ${imported.length} sentences from plan`, "success");
    } catch {
      push("Failed to read study plan.", "error");
    }
  };

  const handleAdd = async () => {
    const text = addInput.trim();
    if (!text || adding) return;

    setAdding(true);
    try {
      const content = await callTutor(
        [
          {
            role: "system",
            content:
              "You are a language tutor. Respond with pure JSON only, no markdown.",
          },
          {
            role: "user",
            content: `The user is learning ${settings.targetLanguage} (native: ${settings.userLanguage}). They entered: "${text}". Determine if this is in ${settings.targetLanguage} or ${settings.userLanguage}. Return a single JSON object with: "target" (the sentence in ${settings.targetLanguage}), "translation" (in ${settings.userLanguage}), "phonetic" (pronunciation guide for the target), "note" (brief grammar/usage tip in ${settings.userLanguage}). If the input is in the target language, use it as "target" and translate. If in the native language, translate it to the target language.`,
          },
        ],
        settings,
      );

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("Could not parse AI response.");
      }

      const item = parsed as Record<string, unknown>;
      const newSentence: AudioPracticeSentence = {
        id: crypto.randomUUID(),
        target: String(item.target ?? text),
        translation: String(item.translation ?? ""),
        phonetic: item.phonetic ? String(item.phonetic) : undefined,
        note: item.note ? String(item.note) : undefined,
      };
      setSentences([...sentences, newSentence]);
      setAddInput("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add sentence.";
      push(msg, "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (player.active?.sentenceId === id) player.stop();
    setSentences(sentences.filter((s) => s.id !== id));
  };

  const handlePlay = async (
    sentence: AudioPracticeSentence,
    speed: "normal" | "slow",
  ) => {
    if (
      player.active?.sentenceId === sentence.id &&
      player.active.speed === speed
    ) {
      player.stop();
      return;
    }
    try {
      await player.play(sentence.id, sentence.target, speed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Playback failed.";
      push(msg, "error");
    }
  };

  const handleDownload = async (sentence: AudioPracticeSentence) => {
    try {
      const blobUrl = await generateSpeech(
        sentence.target,
        settings.apiKey,
        settings.baseUrl,
        voice,
        TTS_DEFAULTS.normalSpeed,
      );
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${sentence.target.slice(0, 40).replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, "").trim()}.mp3`;
      a.click();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      push(msg, "error");
    }
  };

  return (
    <RequireApiKey>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Audio Practice
          </p>
          <h1 className="text-2xl font-bold">Sentence pronunciation trainer</h1>
          <p className="text-slate-300">
            Generate sentences with AI, add your own, or import from your study
            plan. Listen at normal or slow speed.
          </p>
        </div>

        {/* Controls bar */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value as TtsVoice)}
            className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {TTS_VOICES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate with AI"}
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:translate-y-[-1px]"
            onClick={handleImportFromPlan}
          >
            Import from plan
          </button>
        </div>

        {/* Add sentence form */}
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-400">
              Type in either language — AI fills in the rest
            </label>
            <input
              type="text"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              placeholder={`e.g. "Hello, how are you?" or a sentence in ${settings.targetLanguage}`}
              className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={adding}
            />
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:translate-y-[-1px] disabled:opacity-60"
            onClick={handleAdd}
            disabled={!addInput.trim() || adding}
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Sentence list */}
        {sentences.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No sentences yet. Generate some with AI, import from your plan, or
            add your own above.
          </div>
        ) : (
          <div className="space-y-2">
            {sentences.map((sentence) => (
              <SentenceRow
                key={sentence.id}
                sentence={sentence}
                active={player.active}
                state={player.state}
                onPlay={handlePlay}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {sentences.length > 0 && (
          <button
            className="text-sm text-slate-500 transition hover:text-rose-400"
            onClick={() => {
              player.stop();
              setSentences([]);
            }}
          >
            Clear all sentences
          </button>
        )}

        <ToastStack items={toasts} onDismiss={dismiss} />
      </div>
    </RequireApiKey>
  );
}

function SentenceRow({
  sentence,
  active,
  state,
  onPlay,
  onDownload,
  onDelete,
}: {
  sentence: AudioPracticeSentence;
  active: { sentenceId: string; speed: "normal" | "slow" } | null;
  state: "idle" | "loading" | "playing";
  onPlay: (sentence: AudioPracticeSentence, speed: "normal" | "slow") => void;
  onDownload: (sentence: AudioPracticeSentence) => void;
  onDelete: (id: string) => void;
}) {
  const isActive = active?.sentenceId === sentence.id;
  const normalActive = isActive && active.speed === "normal";
  const slowActive = isActive && active.speed === "slow";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow transition hover:border-emerald-400/20">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-50">{sentence.target}</p>
        <p className="text-sm text-slate-300">{sentence.translation}</p>
        {sentence.phonetic && (
          <p className="font-mono text-xs text-emerald-400">
            {sentence.phonetic}
          </p>
        )}
        {sentence.note && (
          <p className="text-xs text-slate-400">{sentence.note}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <PlayButton
          label="Normal"
          isLoading={normalActive && state === "loading"}
          isPlaying={normalActive && state === "playing"}
          onClick={() => onPlay(sentence, "normal")}
        />
        <PlayButton
          label="Slow"
          isLoading={slowActive && state === "loading"}
          isPlaying={slowActive && state === "playing"}
          onClick={() => onPlay(sentence, "slow")}
        />
        <button
          className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-500/15 hover:text-sky-400"
          onClick={() => onDownload(sentence)}
          title="Download audio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400"
          onClick={() => onDelete(sentence.id)}
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PlayButton({
  label,
  isLoading,
  isPlaying,
  onClick,
}: {
  label: string;
  isLoading: boolean;
  isPlaying: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:opacity-60"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg
          className="h-3.5 w-3.5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-25"
          />
          <path
            d="M4 12a8 8 0 018-8"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-75"
          />
        </svg>
      ) : isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="5,3 19,12 5,21" />
        </svg>
      )}
      {label}
    </button>
  );
}

export { AudioPracticePage };
