import type {
  AnswerMetrics,
  CoachQuestion,
  RecordedAnswer,
  SessionScore,
  FocusMetric,
} from "./types";

const STAR_MARKERS = [
  "situazione",
  "contesto",
  "ho fatto",
  "ho deciso",
  "ho gestito",
  "azione",
  "risultato",
  "conseguenza",
  "imparato",
  "alla fine",
  "quindi",
];

const POWER_WORDS = [
  "convinto",
  "risultato",
  "scelto",
  "concreto",
  "ho ottenuto",
  "leadership",
  "responsabilità",
  "differenza",
  "impatto",
  "obiettivo",
];

const FOCUS_METRICS: FocusMetric[] = [
  "presenza",
  "concisione",
  "specificita",
  "struttura",
  "energia",
];

export function scorePresenza(latencyMs: number | null): number {
  if (latencyMs === null) return 0;
  if (latencyMs <= 1500) return 100;
  if (latencyMs <= 3000) return 80;
  if (latencyMs <= 5000) return 60;
  if (latencyMs <= 8000) return 40;
  return 20;
}

export function scoreConcisione(wordCount: number): number {
  if (wordCount >= 40 && wordCount <= 120) return 100;
  if ((wordCount >= 20 && wordCount < 40) || (wordCount > 120 && wordCount <= 180)) return 70;
  if (wordCount >= 10 && wordCount < 20) return 40;
  if (wordCount >= 1 && wordCount < 10) return 15;
  return 50;
}

export function scoreSpecificita(transcript: string, targets: string[]): number {
  if (targets.length === 0) return 70;
  const lower = transcript.toLowerCase();
  const matched = targets.filter((t) => lower.includes(t.toLowerCase())).length;
  const ratio = matched / targets.length;
  if (ratio >= 0.6) return 100;
  if (ratio >= 0.4) return 80;
  if (ratio >= 0.2) return 60;
  if (ratio > 0) return 40;
  return 20;
}

export function scoreStruttura(transcript: string): number {
  const lower = transcript.toLowerCase();
  const matched = STAR_MARKERS.filter((m) => lower.includes(m)).length;
  if (matched >= 4) return 100;
  if (matched >= 2) return 70;
  if (matched >= 1) return 50;
  return 30;
}

export function scoreEnergia(transcript: string): number {
  const words = transcript.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return 0;
  const uniqueRatio = new Set(words).size / words.length;
  const powerCount = POWER_WORDS.filter((p) => transcript.toLowerCase().includes(p)).length;
  const score = uniqueRatio * 70 + Math.min(powerCount, 3) * 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function computeAnswerMetrics(
  question: CoachQuestion,
  transcript: string,
  firstResponseLatencyMs: number | null,
): AnswerMetrics {
  const words = transcript.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) {
    return { presenza: 0, concisione: 0, specificita: 0, struttura: 0, energia: 0 };
  }
  return {
    presenza: scorePresenza(firstResponseLatencyMs),
    concisione: scoreConcisione(words.length),
    specificita: scoreSpecificita(transcript, question.keyword_targets ?? []),
    struttura: scoreStruttura(transcript),
    energia: scoreEnergia(transcript),
  };
}

export function computeSessionScore(answers: RecordedAnswer[]): SessionScore {
  const byMetric: AnswerMetrics = {
    presenza: 0,
    concisione: 0,
    specificita: 0,
    struttura: 0,
    energia: 0,
  };

  for (const metric of FOCUS_METRICS) {
    const focusAnswers = answers.filter((a) => a.focus_metric === metric);
    if (focusAnswers.length > 0) {
      const focusAvg = focusAnswers.reduce((sum, a) => sum + a.metrics[metric], 0) / focusAnswers.length;
      byMetric[metric] = Math.round(focusAvg);
    } else {
      const allAvg = answers.length
        ? answers.reduce((sum, a) => sum + a.metrics[metric], 0) / answers.length
        : 0;
      byMetric[metric] = Math.round(allAvg);
    }
  }

  const overall = Math.round(
    (byMetric.presenza + byMetric.concisione + byMetric.specificita + byMetric.struttura + byMetric.energia) / 5,
  );

  const entries = Object.entries(byMetric) as [FocusMetric, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const strongest = entries[0][0];
  const weakest = entries[entries.length - 1][0];

  return { overall, by_metric: byMetric, strongest_metric: strongest, weakest_metric: weakest };
}
