/**
 * Test: comportamento STT per desktop (continuous:true) e mobile (continuous:false)
 *
 * Desktop: una sessione lunga, event.resultIndex garantisce zero duplicati.
 * Mobile: una frase per sessione, restart 50ms, zero gap artificiale.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock SpeechRecognition ────────────────────────────────────────────────

type RecEvent = {
  results: Array<Array<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
};

class MockRecognition {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((e: RecEvent) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;

  start() { this.started = true; }
  stop() { Promise.resolve().then(() => this.onend?.()); }
  abort() { Promise.resolve().then(() => this.onend?.()); }

  // Simula continuous:true — accumula i risultati finali come fa Chrome
  private _finalResults: Array<Array<{ transcript: string }> & { isFinal: boolean }> = [];

  fireFinalContinuous(text: string) {
    const result = [{ transcript: text }] as unknown as Array<{ transcript: string }> & { isFinal: boolean };
    result.isFinal = true;
    const resultIndex = this._finalResults.length;
    this._finalResults.push(result);
    this.onresult?.({ results: this._finalResults as RecEvent["results"], resultIndex });
    // continuous:true NON chiude la sessione dopo ogni finale
  }

  fireInterimContinuous(text: string) {
    const interim = [{ transcript: text }] as unknown as Array<{ transcript: string }> & { isFinal: boolean };
    interim.isFinal = false;
    const snapshot = [...this._finalResults, interim];
    this.onresult?.({ results: snapshot as RecEvent["results"], resultIndex: this._finalResults.length });
  }

  // Simula continuous:false — una frase → onend
  fireInterim(text: string) {
    const result = [{ transcript: text }] as unknown as Array<{ transcript: string }> & { isFinal: boolean };
    result.isFinal = false;
    this.onresult?.({ results: [result], resultIndex: 0 });
  }
  fireFinal(text: string) {
    const result = [{ transcript: text }] as unknown as Array<{ transcript: string }> & { isFinal: boolean };
    result.isFinal = true;
    this.onresult?.({ results: [result], resultIndex: 0 });
    Promise.resolve().then(() => this.onend?.());
  }
  fireNoSpeech() {
    this.onerror?.({ error: "no-speech" });
    Promise.resolve().then(() => this.onend?.());
  }
}

const instances: MockRecognition[] = [];

// ─── Helpers ───────────────────────────────────────────────────────────────

function setupWindowMock(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
  Object.defineProperty(navigator, "maxTouchPoints", { value: 0, configurable: true });

  (globalThis as unknown as Record<string, unknown>).window = {
    SpeechRecognition: class extends MockRecognition {
      constructor() {
        super();
        instances.push(this as unknown as MockRecognition);
      }
    },
  };
}

beforeEach(() => {
  instances.length = 0;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  delete (globalThis as unknown as Record<string, unknown>).window;
});

async function getStartListening() {
  const mod = await import("../src/coach/voice?t=" + Date.now());
  return mod.startListening;
}

// ─── Desktop tests (continuous:true) ───────────────────────────────────────

describe("Desktop — continuous:true, nessuna parola persa", () => {
  it("3 frasi → onFinal chiamato 3 volte senza gap di restart", async () => {
    setupWindowMock("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124");

    const finalCalls: string[] = [];
    const startListening = await getStartListening();

    startListening({
      onInterim: vi.fn(),
      onFinal: (t) => finalCalls.push(t),
      onError: vi.fn(),
      onEnd: vi.fn(),
    });

    await Promise.resolve();
    expect(instances).toHaveLength(1);
    expect(instances[0].continuous).toBe(true); // KEY: desktop usa continuous:true

    const rec = instances[0];
    // Chrome Desktop: più finali nella stessa sessione aperta
    rec.fireFinalContinuous("prima frase completa");
    rec.fireFinalContinuous("seconda frase");
    rec.fireFinalContinuous("terza frase lunga con parole");

    expect(finalCalls).toEqual([
      "prima frase completa",
      "seconda frase",
      "terza frase lunga con parole",
    ]);
    expect(instances).toHaveLength(1); // ZERO restart — una sola sessione
  });

  it("resultIndex previene il re-processing dei finali precedenti", async () => {
    setupWindowMock("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124");

    const finalCalls: string[] = [];
    const startListening = await getStartListening();

    startListening({
      onInterim: vi.fn(),
      onFinal: (t) => finalCalls.push(t),
      onError: vi.fn(),
      onEnd: vi.fn(),
    });

    await Promise.resolve();
    const rec = instances[0];

    rec.fireFinalContinuous("ciao");
    rec.fireFinalContinuous("come stai");

    expect(finalCalls).toEqual(["ciao", "come stai"]);
    // Nessun duplicato — resultIndex usato correttamente
    expect(new Set(finalCalls).size).toBe(finalCalls.length);
  });
});

// ─── Mobile tests (continuous:false) ───────────────────────────────────────

describe("Mobile — continuous:false, zero duplicati", () => {
  it("onFinal chiamato esattamente 1 volta per utterance", async () => {
    setupWindowMock("Mozilla/5.0 (Linux; Android 14) Mobile Chrome/124");
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 14) Mobile Chrome/124",
      configurable: true,
    });

    const finalCalls: string[] = [];
    const startListening = await getStartListening();

    startListening({
      onInterim: vi.fn(),
      onFinal: (t) => finalCalls.push(t),
      onError: vi.fn(),
      onEnd: vi.fn(),
    });

    await Promise.resolve();
    expect(instances[0].continuous).toBe(false); // Mobile usa continuous:false

    instances[0].fireFinal("risposta mobile");
    await Promise.resolve();
    await Promise.resolve();
    vi.advanceTimersByTime(50);
    await Promise.resolve();

    expect(instances).toHaveLength(2); // restart avvenuto
    expect(finalCalls).toEqual(["risposta mobile"]); // una sola volta
  });
});

// ─── Stop() corretto in entrambi i path ────────────────────────────────────

describe("stop() — blocca restart e chiama onEnd una volta", () => {
  it("desktop: stop durante sessione continua", async () => {
    setupWindowMock("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Chrome/124");

    const onEndCalls: number[] = [];
    const startListening = await getStartListening();
    const handle = startListening({
      onInterim: vi.fn(),
      onFinal: vi.fn(),
      onError: vi.fn(),
      onEnd: () => onEndCalls.push(1),
    });

    await Promise.resolve();
    handle!.stop();
    await Promise.resolve();
    await Promise.resolve();

    expect(onEndCalls).toHaveLength(1);
    expect(instances).toHaveLength(1); // nessuna nuova sessione dopo stop
  });
});
