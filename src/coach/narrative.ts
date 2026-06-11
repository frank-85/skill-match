import type { FocusMetric, RecordedAnswer, SessionScore } from "./types";

const METRIC_LABELS: Record<FocusMetric, string> = {
  presenza: "Presenza",
  concisione: "Concisione",
  specificita: "Specificità",
  struttura: "Struttura",
  energia: "Energia",
};

const STRENGTH_PHRASE: Record<FocusMetric, string> = {
  presenza: "Rispondi rapido senza esitare, e questo trasmette sicurezza.",
  concisione: "Le tue risposte hanno la giusta densità: né scarne, né prolisse.",
  specificita: "Usi parole chiave del ruolo che dimostrano padronanza del contesto.",
  struttura: "Le tue risposte hanno una narrativa chiara: situazione, azione, risultato.",
  energia: "Comunichi con varietà e parole forti, lasci il segno.",
};

const IMPROVEMENT_PHRASE: Record<FocusMetric, string> = {
  presenza: "Inizia a parlare entro 2-3 secondi dalla domanda. Anche \"ottima domanda, lasciami pensare\" vale.",
  concisione: "Punta a risposte di 40-120 parole. Se vai oltre, l'ascoltatore si perde.",
  specificita: "Inserisci parole tecniche e nomi concreti del ruolo: cliente, brand, processo, tecnologia.",
  struttura: "Usa il metodo STAR: Situazione, azione che hai fatto, Risultato concreto, lezione imparata.",
  energia: "Evita ripetizioni e ridondanze. Inserisci verbi d'impatto: ho ottenuto, ho scelto, ho convinto.",
};

export function strengthNarrative(score: SessionScore): string {
  return `Punto di forza — ${METRIC_LABELS[score.strongest_metric]}: ${STRENGTH_PHRASE[score.strongest_metric]}`;
}

export function improvementNarrative(score: SessionScore): string {
  return `Cosa rafforzare — ${METRIC_LABELS[score.weakest_metric]}: ${IMPROVEMENT_PHRASE[score.weakest_metric]}`;
}

export function turnFeedback(answer: RecordedAnswer): string {
  const focusScore = answer.metrics[answer.focus_metric];
  const label = METRIC_LABELS[answer.focus_metric];
  if (focusScore >= 80) {
    return `Forte ${label.toLowerCase()} (${focusScore}%). ${strengthFlash(answer)}`;
  }
  if (focusScore >= 60) {
    return `Buon livello di ${label.toLowerCase()} (${focusScore}%). Puoi spingere ancora.`;
  }
  return `${label} ${focusScore}%. ${IMPROVEMENT_PHRASE[answer.focus_metric]}`;
}

function strengthFlash(answer: RecordedAnswer): string {
  if (answer.matched_keywords.length > 0) {
    const sample = answer.matched_keywords.slice(0, 3).join(", ");
    return `Hai citato: "${sample}".`;
  }
  return "Continua così.";
}

export function metricLabel(metric: FocusMetric): string {
  return METRIC_LABELS[metric];
}
