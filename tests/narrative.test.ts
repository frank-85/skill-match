import { describe, it, expect } from "vitest";
import { buildWhyMatch, buildGapNarrative } from "../src/engine/narrative";
import type { JobMatch } from "../src/engine/types";

const tagLabels: Record<string, string> = {
  "tech.python": "Python",
  "tech.javascript": "JavaScript",
  "sell.b2b_field": "Vendita B2B sul campo",
  "sell.key_account": "Gestione clienti chiave",
};

describe("buildWhyMatch", () => {
  it("1. dice quante competenze chiave su totale", () => {
    const match = {
      matched_tags: ["tech.python", "tech.javascript"],
      gap_tags: [{ tag: "tech.data", gap: 1, required: 2, current: 1 }],
      job: { required_tags: { "tech.python": 3, "tech.javascript": 2, "tech.data": 2 } },
    } as unknown as JobMatch;
    const text = buildWhyMatch(match, tagLabels);
    expect(text).toMatch(/2\/3/);
    expect(text).toMatch(/Python|JavaScript/);
  });

  it("2. profilo perfect-match → frase positiva senza gap", () => {
    const match = {
      matched_tags: ["tech.python", "tech.javascript"],
      gap_tags: [],
      job: { required_tags: { "tech.python": 3, "tech.javascript": 2 } },
    } as unknown as JobMatch;
    const text = buildWhyMatch(match, tagLabels);
    expect(text).toMatch(/2\/2/);
  });
});

describe("buildGapNarrative", () => {
  it("3. lista i top 2-3 gap con livelli", () => {
    const match = {
      score: 0.5,
      gap_tags: [
        { tag: "sell.key_account", gap: 2, required: 4, current: 2 },
        { tag: "sell.b2b_field", gap: 1, required: 4, current: 3 },
      ],
    } as unknown as JobMatch;
    const text = buildGapNarrative(match, tagLabels);
    expect(text).toMatch(/Gestione clienti chiave|Vendita B2B/);
    expect(text).toMatch(/\+\d/);
  });

  it("4. profilo perfect-match → messaggio motivante senza gap", () => {
    const match = {
      score: 1.0,
      gap_tags: [],
    } as unknown as JobMatch;
    const text = buildGapNarrative(match, tagLabels);
    expect(text.toLowerCase()).toMatch(/match completo|nessun gap|pronto/);
  });
});
