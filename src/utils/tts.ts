import type { TtsVoice } from "../types";
import { TTS_DEFAULTS } from "../lib/constants";

const audioCache = new Map<string, string>();

export function deriveTtsUrl(baseUrl: string): string {
  const chatSuffix = "/chat/completions";
  if (baseUrl.endsWith(chatSuffix)) {
    return baseUrl.slice(0, -chatSuffix.length) + "/audio/speech";
  }
  // Fallback: try appending to the base as-is
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed + "/audio/speech";
}

export async function generateSpeech(
  text: string,
  apiKey: string,
  baseUrl: string,
  voice: TtsVoice = TTS_DEFAULTS.voice,
  speed: number = TTS_DEFAULTS.normalSpeed,
): Promise<string> {
  const cacheKey = `${text}::${speed}::${voice}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  const ttsUrl = deriveTtsUrl(baseUrl);
  const response = await fetch(ttsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: TTS_DEFAULTS.model,
      input: text,
      voice,
      speed,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let message = `TTS request failed: ${response.status}`;
    try {
      const err = JSON.parse(body);
      if (err.error?.message) message += ` - ${err.error.message}`;
      else message += ` ${body}`;
    } catch {
      message += ` ${body}`;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  audioCache.set(cacheKey, blobUrl);
  return blobUrl;
}

export function clearAudioCache(): void {
  for (const url of audioCache.values()) {
    URL.revokeObjectURL(url);
  }
  audioCache.clear();
}
