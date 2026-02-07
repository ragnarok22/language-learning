import { useCallback, useEffect, useRef, useState } from "react";
import type { TtsVoice } from "../types";
import { generateSpeech, clearAudioCache } from "../utils/tts";

type PlaybackState = "idle" | "loading" | "playing";

export type ActivePlayback = {
  sentenceId: string;
  speed: "normal" | "slow";
} | null;

export function useAudioPlayer(
  apiKey: string,
  baseUrl: string,
  voice: TtsVoice,
  normalSpeed: number,
  slowSpeed: number,
) {
  const [state, setState] = useState<PlaybackState>("idle");
  const [active, setActive] = useState<ActivePlayback>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState("idle");
    setActive(null);
  }, []);

  const play = useCallback(
    async (sentenceId: string, text: string, speed: "normal" | "slow") => {
      stop();
      setState("loading");
      setActive({ sentenceId, speed });

      try {
        const rate = speed === "slow" ? slowSpeed : normalSpeed;
        const blobUrl = await generateSpeech(text, apiKey, baseUrl, voice, rate);
        const audio = new Audio(blobUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
          setState("idle");
          setActive(null);
          audioRef.current = null;
        });

        setState("playing");
        await audio.play();
      } catch (err) {
        setState("idle");
        setActive(null);
        throw err;
      }
    },
    [apiKey, baseUrl, voice, normalSpeed, slowSpeed, stop],
  );

  useEffect(() => {
    return () => {
      stop();
      clearAudioCache();
    };
  }, [stop]);

  return { state, active, play, stop };
}
