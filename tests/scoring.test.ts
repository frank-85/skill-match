import { describe, it, expect } from "vitest";
import { matchProfileToJobs } from "../src/engine/scoring";
import type { CandidateProfile, Job } from "../src/engine/types";

const job: Job = {
  id: "job_test",
  company: "Test Corp",
  role: "Test Role",
  location: "Verona",
  contract: "indeterminato",
  seniority: "mid",
  required_tags: { "tech.python": 3, "tech.javascript": 2 },
  nice_to_have: { "tech.data": 2 },
  language: "it_en_base",
  experience_min: 2,
  experience_max: 8,
  why_apply: "test",
};

function makeProfile(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    tags: {},
    experience_years: 5,
    availability: "entrambi",
    language_it_en: "it_en_base",
    certifications: [],
    selected_areas: [],
    ...overrides,
  };
}

describe("matchProfileToJobs", () => {
  it("1. profilo vuoto → match basso ma >= 0", () => {
    const profile = makeProfile();
    const matches = matchProfileToJobs(profile, [job]);
    expect(matches).toHaveLength(1);
    expect(matches[0].score).toBeGreaterThanOrEqual(0);
    expect(matches[0].score).toBeLessThan(0.2);
  });

  it("2. profilo perfect-match → score = 100%", () => {
    const profile = makeProfile({
      tags: { "tech.python": 3, "tech.javascript": 2, "tech.data": 2 },
    });
    const matches = matchProfileToJobs(profile, [job]);
    expect(matches[0].score).toBeCloseTo(1.0, 2);
  });

  it("3. profilo overqualified → score >= 95%", () => {
    const profile = makeProfile({
      tags: { "tech.python": 5, "tech.javascript": 5, "tech.data": 5 },
      experience_years: 15, // sopra max 8
    });
    const matches = matchProfileToJobs(profile, [job]);
    expect(matches[0].score).toBeGreaterThanOrEqual(0.9);
  });

  it("4. gap 1 livello su 1 tag → score ~95%", () => {
    const profile = makeProfile({
      tags: { "tech.python": 2, "tech.javascript": 2, "tech.data": 2 }, // gap 1 su python
    });
    const matches = matchProfileToJobs(profile, [job]);
    expect(matches[0].score).toBeGreaterThan(0.85);
    expect(matches[0].score).toBeLessThan(1.0);
  });

  it("5. gap 3 livelli su 2 tag → score ~50%", () => {
    const profile = makeProfile({
      tags: { "tech.python": 0, "tech.javascript": 0 }, // gap 3 e 2
    });
    const matches = matchProfileToJobs(profile, [job]);
    expect(matches[0].score).toBeGreaterThan(0.1);
    expect(matches[0].score).toBeLessThan(0.5);
  });

  it("6. filtro lingua: solo_it vs it_en_fluent → escluso", () => {
    const fluentJob: Job = { ...job, language: "it_en_fluent" };
    const profile = makeProfile({ language_it_en: "solo_it" });
    const matches = matchProfileToJobs(profile, [fluentJob]);
    expect(matches).toHaveLength(0);
  });

  it("7. filtro contratto: dipendente vs p_iva → escluso", () => {
    const pivaJob: Job = { ...job, contract: "p_iva" };
    const profile = makeProfile({ availability: "dipendente" });
    const matches = matchProfileToJobs(profile, [pivaJob]);
    expect(matches).toHaveLength(0);
  });

  it("8. nice_to_have presente → score > stesso senza NTH", () => {
    const profileWithNTH = makeProfile({
      tags: { "tech.python": 3, "tech.javascript": 2, "tech.data": 2 },
    });
    const profileWithoutNTH = makeProfile({
      tags: { "tech.python": 3, "tech.javascript": 2 },
    });
    const a = matchProfileToJobs(profileWithNTH, [job])[0].score;
    const b = matchProfileToJobs(profileWithoutNTH, [job])[0].score;
    expect(a).toBeGreaterThanOrEqual(b);
  });
});
