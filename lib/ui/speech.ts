// Recherche vocale (ex-V2, active dans le prototype ; ⚠️ v1 ou v2 encore ouvert) : API Web Speech
// du navigateur, sans dépendance. null quand le navigateur ne la propose pas.

type Rec = { lang: string; interimResults: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };

export function startDictation(onText: (t: string) => void, onEnd?: () => void): { stop(): void } | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = "fr-FR";
  r.interimResults = true;
  r.onresult = (e) => onText(Array.from(e.results).map((x) => x[0].transcript).join(" "));
  r.onend = () => onEnd?.();
  r.onerror = () => onEnd?.();
  r.start();
  return { stop: () => r.stop() };
}

export const NO_VOICE = "La recherche vocale n'est pas disponible sur ce navigateur.";
