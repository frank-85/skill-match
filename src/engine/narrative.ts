import type { JobMatch } from "./types";

/**
 * Genera una frase del tipo:
 * "Hai 3/4 competenze chiave: Python, AI tools, vendita B2B."
 */
export function buildWhyMatch(match: JobMatch, tagLabels: Record<string, string>): string {
  const requiredCount = Object.keys(match.job.required_tags).length;
  const matchedRequired = match.matched_tags.filter(
    (t) => t in match.job.required_tags,
  );
  const matchedCount = matchedRequired.length;

  const topNames = matchedRequired
    .slice(0, 3)
    .map((t) => tagLabels[t] ?? t)
    .join(", ");

  if (matchedCount === 0) {
    return `0/${requiredCount} competenze chiave matchate. Le richieste superano il tuo profilo attuale.`;
  }

  const list = topNames.length > 0 ? `: ${topNames}` : ".";
  return `Hai ${matchedCount}/${requiredCount} competenze chiave${list}.`;
}

/**
 * Genera una frase del tipo:
 * "Per arrivare all'80% sviluppa: gestione clienti chiave (livello +2), HORECA (livello +3)."
 */
export function buildGapNarrative(match: JobMatch, tagLabels: Record<string, string>): string {
  if (match.gap_tags.length === 0) {
    return "Match completo: sei pronto per candidarti senza gap significativi.";
  }

  const target = Math.min(100, Math.round(match.score * 100) + 20);
  const topGaps = [...match.gap_tags]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const parts = topGaps
    .map((g) => `${tagLabels[g.tag] ?? g.tag} (livello +${g.gap})`)
    .join(", ");

  return `Per arrivare a circa il ${target}% sviluppa: ${parts}.`;
}
