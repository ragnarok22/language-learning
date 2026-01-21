type VoiceOption = { lang: string; label: string };

const getVoicesSafe = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [] as SpeechSynthesisVoice[];
  }
  return speechSynthesis.getVoices();
};

export function listVoiceLanguages(): VoiceOption[] {
  const voices = getVoicesSafe();
  const byLang = new Map<string, string>();

  voices.forEach((voice) => {
    if (!byLang.has(voice.lang)) {
      byLang.set(voice.lang, `${voice.lang} — ${voice.name}`);
    }
  });

  return Array.from(byLang.entries())
    .map(([lang, label]) => ({ lang, label }))
    .sort((a, b) => a.lang.localeCompare(b.lang));
}

export function getVoiceForLanguage(
  targetLanguage: string,
): SpeechSynthesisVoice | undefined {
  const voices = getVoicesSafe();
  if (!voices.length) return undefined;

  const normalizedTarget = targetLanguage.toLowerCase();
  const codeMatch = targetLanguage.match(/\(([a-z0-9-]+)\)/i);
  const code = codeMatch?.[1]?.toLowerCase();

  const byExactCode = voices.find(
    (voice) => voice.lang.toLowerCase() === (code ?? normalizedTarget),
  );
  if (byExactCode) return byExactCode;

  const byBaseLang = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith((code ?? normalizedTarget).slice(0, 2)),
  );
  if (byBaseLang) return byBaseLang;

  const byName = voices.find((voice) =>
    voice.name.toLowerCase().includes(normalizedTarget),
  );
  if (byName) return byName;

  return voices[0];
}
