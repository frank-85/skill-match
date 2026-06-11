import type { VoiceCapabilities } from "./types";

// ─── Capability detection ────────────────────────────────

export function detectVoiceCapabilities(): VoiceCapabilities {
  const w = window as unknown as {
    speechSynthesis?: SpeechSynthesis;
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return {
    tts: typeof w.speechSynthesis !== "undefined",
    stt:
      typeof w.SpeechRecognition !== "undefined" ||
      typeof w.webkitSpeechRecognition !== "undefined",
  };
}

// ─── TTS ────────────────────────────────────────────────

let cachedItalianVoice: SpeechSynthesisVoice | null = null;

const PREFERRED_VOICE_NAMES = [
  "Microsoft Elsa Online",
  "Microsoft Elsa",
  "Google italiano",
  "Alice",
  "Federica",
];

async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const initial = synth.getVoices();
    if (initial.length > 0) { resolve(initial); return; }
    const handler = () => {
      synth.removeEventListener("voiceschanged", handler);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", handler);
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", handler);
      resolve(synth.getVoices());
    }, 500);
  });
}

async function selectItalianVoice(): Promise<SpeechSynthesisVoice | null> {
  if (cachedItalianVoice) return cachedItalianVoice;
  const voices = await loadVoices();
  for (const preferred of PREFERRED_VOICE_NAMES) {
    const found = voices.find((v) => v.name === preferred);
    if (found) { cachedItalianVoice = found; return found; }
  }
  const anyItalian = voices.find((v) => v.lang.toLowerCase().startsWith("it"));
  if (anyItalian) { cachedItalianVoice = anyItalian; return anyItalian; }
  return null;
}

export interface SpeakOptions {
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (typeof window.speechSynthesis === "undefined") {
    opts.onError?.("TTS not supported");
    return;
  }
  window.speechSynthesis.cancel();
  const voice = await selectItalianVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "it-IT";
  utter.rate = 0.95;
  utter.pitch = 1.0;
  if (voice) utter.voice = voice;
  utter.onend = () => opts.onEnd?.();
  utter.onerror = (e) => opts.onError?.(String(e.error ?? "tts error"));
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech(): void {
  if (typeof window.speechSynthesis !== "undefined") {
    window.speechSynthesis.cancel();
  }
}

// ─── STT ────────────────────────────────────────────────

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
}

function getSpeechRecognitionCtor(): { new (): RecognitionLike } | null {
  const w = window as unknown as {
    SpeechRecognition?: { new (): RecognitionLike };
    webkitSpeechRecognition?: { new (): RecognitionLike };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Rileva mobile: Chrome Android e iOS Safari richiedono continuous:false
// per evitare buffer replay e duplicati strutturali.
// Desktop Chrome/Edge/Firefox usano continuous:true — nessun gap tra frasi.
export function isMobileBrowser(): boolean {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(ua) ||
    // iPad su iOS 13+ si presenta come Mac con touch
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
}

export interface ListenHandle {
  stop: () => void;
}

export interface ListenCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (err: string) => void;
  onEnd: () => void;
}

export function startListening(callbacks: ListenCallbacks): ListenHandle | null {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    callbacks.onError("stt-not-supported");
    return null;
  }
  return isMobileBrowser()
    ? startListeningMobile(Ctor, callbacks)
    : startListeningDesktop(Ctor, callbacks);
}

// ─── Desktop: continuous:true ─────────────────────────────
// Una sessione lunga. event.resultIndex garantisce che ogni frase finale
// venga consegnata UNA sola volta — nessun gap, nessuna parola persa.
// Chrome Desktop chiude la sessione solo dopo silenzio molto prolungato
// (~60s): in quel caso onEnd → restart immediato senza buffer replay.

function startListeningDesktop(
  Ctor: { new (): RecognitionLike },
  callbacks: ListenCallbacks,
): ListenHandle {
  let stopped = false;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;
  let currentRec: RecognitionLike | null = null;

  function createAndStart(): void {
    if (stopped) return;

    const rec = new Ctor();
    currentRec = rec;
    rec.lang = "it-IT";
    rec.continuous = true;       // Sessione aperta: zero gap tra frasi
    rec.interimResults = true;

    rec.onresult = (event) => {
      // Processa solo i result a partire da resultIndex per evitare
      // di rielaborare finali già consegnati nelle chiamate precedenti.
      let newFinal = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as ArrayLike<{ transcript: string }> & { isFinal: boolean };
        const text = result[0].transcript;
        if (result.isFinal) newFinal += text;
        else interim += text;
      }
      if (newFinal.trim()) callbacks.onFinal(newFinal.trim());
      if (interim.trim()) callbacks.onInterim(interim.trim());
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "network") return; // hook gestisce il recovery
      callbacks.onError(e.error);
    };

    rec.onend = () => {
      if (currentRec !== rec) return;
      currentRec = null;
      if (!stopped) {
        // Chrome ha chiuso la sessione (silenzio lungo o timeout interno)
        // Restart immediato — su desktop non c'è buffer replay
        restartTimer = setTimeout(createAndStart, 50);
      } else {
        callbacks.onEnd();
      }
    };

    try {
      rec.start();
    } catch {
      if (!stopped) restartTimer = setTimeout(createAndStart, 300);
    }
  }

  createAndStart();

  return {
    stop: () => {
      stopped = true;
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
      // Non nullare currentRec qui: onend lo farà e chiamerà callbacks.onEnd()
      // perché a quel punto stopped === true.
      if (currentRec) {
        try { currentRec.stop(); } catch { callbacks.onEnd(); }
      } else {
        callbacks.onEnd();
      }
    },
  };
}

// ─── Mobile: continuous:false ─────────────────────────────
// Una frase per sessione (Google Docs pattern).
// Chrome Android e iOS Safari chiudono le sessioni continuous:true,
// causando audio buffer replay e duplicati impossibili da deduplicare.
// continuous:false: ogni sessione → una frase → onEnd → restart 50ms.

function startListeningMobile(
  Ctor: { new (): RecognitionLike },
  callbacks: ListenCallbacks,
): ListenHandle {
  let stopped = false;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;
  let currentRec: RecognitionLike | null = null;

  function createAndStart(): void {
    if (stopped) return;

    const rec = new Ctor();
    currentRec = rec;
    rec.lang = "it-IT";
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i] as ArrayLike<{ transcript: string }> & { isFinal: boolean };
        const text = result[0].transcript;
        if (result.isFinal) finalText += text;
        else interim += text;
      }
      if (finalText) callbacks.onFinal(finalText);
      if (interim) callbacks.onInterim(interim);
    };

    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      callbacks.onError(e.error);
    };

    rec.onend = () => {
      if (currentRec !== rec) return;
      currentRec = null;
      if (!stopped) {
        restartTimer = setTimeout(createAndStart, 50);
      } else {
        callbacks.onEnd();
      }
    };

    try {
      rec.start();
    } catch {
      if (!stopped) restartTimer = setTimeout(createAndStart, 300);
    }
  }

  createAndStart();

  return {
    stop: () => {
      stopped = true;
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null; }
      if (currentRec) {
        try { currentRec.stop(); } catch { callbacks.onEnd(); }
      } else {
        callbacks.onEnd();
      }
    },
  };
}

// ─── Mic level monitor ──────────────────────────────────
// Usa AudioContext + AnalyserNode per leggere il volume RMS del microfono
// in tempo reale (0-1). Indipendente dal Web Speech API — non interferisce.

export function startMicLevelMonitor(onLevel: (level: number) => void): () => void {
  let rafId = 0;
  let stopped = false;

  if (!navigator.mediaDevices?.getUserMedia) return () => {};

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
      if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); ctx.close(); return; }
        analyser.getByteFrequencyData(buf);
        // RMS normalizzato: 0 = silenzio, 1 = picco
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        onLevel(Math.min(rms / 60, 1));
        rafId = requestAnimationFrame(tick);
      }
      tick();
    })
    .catch(() => onLevel(0));

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}

// ─── Mobile vibration helper ────────────────────────────

export function vibrate(pattern: number | number[] = 100): void {
  if (typeof navigator.vibrate === "function") {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}
