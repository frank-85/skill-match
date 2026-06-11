import { describe, it, expect } from "vitest";
import {
  scorePresenza,
  scoreConcisione,
  scoreSpecificita,
  scoreStruttura,
  scoreEnergia,
  computeAnswerMetrics,
} from "../src/coach/scoring";
import type { CoachQuestion } from "../src/coach/types";

const mockQuestion: CoachQuestion = {
  id: "q_test",
  type: "behavioral_star",
  text: "Dimmi di una sfida che hai affrontato.",
  focus_metric: "struttura",
  keyword_targets: ["sfida", "risultato", "team"],
};

describe("scorePresenza (latency-based)", () => {
  it("1. latency 1000ms → 100", () => {
    expect(scorePresenza(1000)).toBe(100);
  });
  it("2. latency 6000ms → ~40", () => {
    expect(scorePresenza(6000)).toBeGreaterThanOrEqual(30);
    expect(scorePresenza(6000)).toBeLessThanOrEqual(60);
  });
  it("null latency → 0 (nessuna risposta rilevata)", () => {
    expect(scorePresenza(null)).toBe(0);
  });
});

describe("scoreConcisione (word-count-based)", () => {
  it("3. 50 words → 100 (sweet spot)", () => {
    expect(scoreConcisione(50)).toBe(100);
  });
  it("4. 10 words → 40 (corta)", () => {
    expect(scoreConcisione(10)).toBe(40);
  });
  it("4b. 5 words → 15 (molto lacunosa)", () => {
    expect(scoreConcisione(5)).toBe(15);
  });
  it("4c. 1 word → 15 (quasi assente)", () => {
    expect(scoreConcisione(1)).toBe(15);
  });
});

describe("scoreSpecificita (keyword matching)", () => {
  it("5. 5/9 keywords matched → 80", () => {
    const transcript = "ho gestito un cliente importante nel canale horeca con un buon margine grazie alla negoziazione";
    const targets = ["cliente", "trattativa", "horeca", "ho.re.ca", "ristorante", "bar", "hotel", "margine", "negoziazione"];
    expect(scoreSpecificita(transcript, targets)).toBe(80);
  });
  it("6. 0 keywords → 20", () => {
    expect(scoreSpecificita("blah blah niente di rilevante", ["specifico", "tecnico"])).toBe(20);
  });
});

describe("scoreStruttura (STAR markers)", () => {
  it("7. 4+ STAR markers → 100", () => {
    const transcript = "La situazione era critica. Ho deciso di intervenire. L'azione che ho fatto è stata chiamare il cliente. Il risultato è stato che ho imparato molto.";
    expect(scoreStruttura(transcript)).toBe(100);
  });
  it("8. 0 STAR markers → 30", () => {
    expect(scoreStruttura("blah generico senza alcuna struttura narrativa")).toBe(30);
  });
});

describe("scoreEnergia (uniqueness + power words)", () => {
  it("9. high uniqueness + power words → high score", () => {
    const transcript = "Ho ottenuto un risultato concreto con leadership e responsabilità. Ho fatto la differenza.";
    const score = scoreEnergia(transcript);
    expect(score).toBeGreaterThan(70);
  });
  it("10. low uniqueness → low energia", () => {
    const transcript = "uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh uh";
    expect(scoreEnergia(transcript)).toBeLessThan(50);
  });
});

describe("computeAnswerMetrics — risposta saltata / vuota", () => {
  it("11. transcript vuoto (domanda saltata) → tutti i punteggi a 0", () => {
    const metrics = computeAnswerMetrics(mockQuestion, "", null);
    expect(metrics.presenza).toBe(0);
    expect(metrics.concisione).toBe(0);
    expect(metrics.specificita).toBe(0);
    expect(metrics.struttura).toBe(0);
    expect(metrics.energia).toBe(0);
  });
  it("12. transcript vuoto anche con latency non-null → tutti a 0", () => {
    const metrics = computeAnswerMetrics(mockQuestion, "   ", 800);
    expect(metrics.presenza).toBe(0);
    expect(metrics.concisione).toBe(0);
    expect(metrics.specificita).toBe(0);
  });
  it("13. risposta reale breve (5 parole) → concisione 15, non 0", () => {
    const metrics = computeAnswerMetrics(mockQuestion, "Ho gestito bene la sfida", 2000);
    expect(metrics.concisione).toBe(15);
    expect(metrics.presenza).toBeGreaterThan(0);
  });
});
