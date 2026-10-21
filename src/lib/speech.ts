export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = 0.98;
  const voice = pickPortugueseVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
  return true;
}

function pickPortugueseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang.toLowerCase() === "pt-br") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    null
  );
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

type Recognition = {
  start: () => void;
  stop: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } }; resultIndex: number }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => Recognition)
    | undefined;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "pt-BR";
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}
