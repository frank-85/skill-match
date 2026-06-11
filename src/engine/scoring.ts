import { applyCertificationBonus } from "./certifications";
import type {
  CandidateProfile,
  Job,
  JobMatch,
  LanguageLevel,
  SkillLevel,
} from "./types";

const LANG_RANK: Record<LanguageLevel, number> = {
  solo_it: 0,
  it_en_base: 1,
  it_en_fluent: 2,
};

// Curva non-lineare: gap=1 quasi indolore, gap>=2 punisce duramente.
// Indice = gap (richiesto - posseduto). Gap >= 4 → 0 (skill completamente assente).
const GAP_CONTRIB: number[] = [1.0, 0.9, 0.25, 0.1, 0.0];
const NTH_WEIGHT = 0.3;

function gapContribution(gap: number): number {
  if (gap <= 0) return 1.0;
  if (gap >= GAP_CONTRIB.length) return 0;
  return GAP_CONTRIB[gap];
}
const MOD_UNDERQUALIFIED = -0.10;
const MOD_OVERQUALIFIED = -0.05;
const MOD_LANG_BONUS = 0.03;
const EXP_MAX_OVER = 5; // soglia overqualification (max_exp + 5)
const EXP_MIN_TOLERANCE = 2; // gap esperienza ammesso

// ─── Filtri hard ─────────────────────────────────────────

function passesContractFilter(profile: CandidateProfile, job: Job): boolean {
  if (profile.availability === "entrambi") return true;
  if (profile.availability === "dipendente") return job.contract !== "p_iva";
  if (profile.availability === "p_iva") return job.contract === "p_iva";
  return true;
}

function passesLanguageFilter(profile: CandidateProfile, job: Job): boolean {
  return LANG_RANK[profile.language_it_en] >= LANG_RANK[job.language];
}

function passesExperienceFilter(profile: CandidateProfile, job: Job): boolean {
  const gap = job.experience_min - profile.experience_years;
  return gap <= EXP_MIN_TOLERANCE;
}

// ─── Tag scoring ─────────────────────────────────────────

interface TagScoreResult {
  tag_score: number;
  matched: string[];
  gaps: Array<{ tag: string; gap: number; required: number; current: number }>;
}

function computeTagScore(profile: CandidateProfile, job: Job): TagScoreResult {
  const matched: string[] = [];
  const gaps: TagScoreResult["gaps"] = [];

  let totalContrib = 0;
  let totalWeight = 0;

  // Required tags
  for (const [tag, required] of Object.entries(job.required_tags)) {
    const current = (profile.tags[tag] ?? 0) as SkillLevel;
    const contrib = gapContribution(required - current);
    totalContrib += contrib;
    totalWeight += 1;
    if (current >= required) {
      matched.push(tag);
    } else {
      gaps.push({ tag, gap: required - current, required, current });
    }
  }

  // Nice-to-have tags
  for (const [tag, required] of Object.entries(job.nice_to_have)) {
    const current = (profile.tags[tag] ?? 0) as SkillLevel;
    const contrib = gapContribution(required - current);
    totalContrib += contrib * NTH_WEIGHT;
    totalWeight += NTH_WEIGHT;
    if (current >= required) {
      matched.push(tag);
    }
  }

  const tag_score = totalWeight > 0 ? totalContrib / totalWeight : 0;
  return { tag_score, matched, gaps };
}

// ─── Modificatori ────────────────────────────────────────

interface ModifierResult {
  final_score: number;
  applied: string[];
}

function applyModifiers(tag_score: number, profile: CandidateProfile, job: Job): ModifierResult {
  let score = tag_score;
  const applied: string[] = [];

  if (profile.experience_years < job.experience_min) {
    score += MOD_UNDERQUALIFIED;
    applied.push(`underqualified (${MOD_UNDERQUALIFIED * 100}%)`);
  }

  if (profile.experience_years > job.experience_max + EXP_MAX_OVER) {
    score += MOD_OVERQUALIFIED;
    applied.push(`overqualified (${MOD_OVERQUALIFIED * 100}%)`);
  }

  if (LANG_RANK[profile.language_it_en] > LANG_RANK[job.language]) {
    score += MOD_LANG_BONUS;
    applied.push(`language bonus (+${MOD_LANG_BONUS * 100}%)`);
  }

  return { final_score: Math.max(0, Math.min(1, score)), applied };
}

// ─── Entry point ─────────────────────────────────────────

/**
 * Matcha il profilo contro la lista dei ruoli.
 * Ritorna SOLO i ruoli sopravvissuti ai filtri, ordinati per score desc.
 * NON limita a top-N (lo fa il chiamante).
 */
export function matchProfileToJobs(rawProfile: CandidateProfile, jobs: Job[]): JobMatch[] {
  const profile = applyCertificationBonus(rawProfile);
  const results: JobMatch[] = [];

  for (const job of jobs) {
    if (!passesContractFilter(profile, job)) continue;
    if (!passesLanguageFilter(profile, job)) continue;
    if (!passesExperienceFilter(profile, job)) continue;

    const { tag_score, matched, gaps } = computeTagScore(profile, job);
    const { final_score, applied } = applyModifiers(tag_score, profile, job);

    results.push({
      job,
      score: final_score,
      tag_score,
      modifiers_applied: applied,
      matched_tags: matched,
      gap_tags: gaps,
      why_match: "", // popolato da narrative.ts
      gap_narrative: "", // popolato da narrative.ts
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
