// ─── Tassonomia ───────────────────────────────────────────

export type MacroArea = "TECH" | "BIZ" | "SELL" | "CREA" | "OPS" | "REL" | "CRAFT";

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type Availability = "dipendente" | "p_iva" | "entrambi";

export type LanguageLevel = "solo_it" | "it_en_base" | "it_en_fluent";

export type ContractType = "indeterminato" | "p_iva" | "co_co_co" | "stage";

export type Seniority = "junior" | "mid" | "senior";

export type CertificationId =
  | "google_ads"
  | "hubspot"
  | "microsoft_office"
  | "aws_azure"
  | "pmp"
  | "salesforce_admin"
  | "adobe_certified"
  | "cambridge_toefl_ielts"
  | "ecdl"
  | "altro";

// ─── Profilo candidato ───────────────────────────────────

export interface CandidateProfile {
  tags: Record<string, SkillLevel>;
  experience_years: number;      // 0-20, capped
  availability: Availability;
  language_it_en: LanguageLevel;
  certifications: CertificationId[];
  certifications_other?: string;
  selected_areas: MacroArea[];
  education?: string;
  sectors?: string[];
  notes?: string;
}

// ─── Catalogo ruoli ──────────────────────────────────────

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  contract: ContractType;
  seniority: Seniority;
  required_tags: Record<string, SkillLevel>;
  nice_to_have: Record<string, SkillLevel>;
  language: LanguageLevel;
  experience_min: number;
  experience_max: number;
  why_apply: string;
}

// ─── Output matching ─────────────────────────────────────

export interface JobMatch {
  job: Job;
  score: number;              // 0-1
  tag_score: number;          // 0-1, prima dei modificatori
  modifiers_applied: string[];
  matched_tags: string[];     // tag in cui livello candidato >= richiesto
  gap_tags: Array<{ tag: string; gap: number; required: number; current: number }>;
  why_match: string;          // popolato da narrative.ts
  gap_narrative: string;      // popolato da narrative.ts
}

// ─── Tassonomia skill (skills.json) ──────────────────────

export interface SkillTag {
  id: string;          // es. "tech.python"
  label: string;       // es. "Python"
  area: MacroArea;
}

export interface SkillsTaxonomy {
  areas: Record<MacroArea, { label: string; description: string; icon: string }>;
  tags: SkillTag[];
}

// ─── Questionario (questions.json) ───────────────────────

export type QuestionType =
  | "intro_text"
  | "single_choice"
  | "multi_choice"
  | "slider"
  | "tag_scale";

export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
}

export interface TagScaleItem {
  tag: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  help?: string;
  show_if?: { selected_areas_contains?: MacroArea };
  // Per single/multi choice
  options?: QuestionOption[];
  max_select?: number;
  // Per slider
  min?: number;
  max?: number;
  step?: number;
  // Per tag_scale
  items?: TagScaleItem[];
  scale_labels?: string[];
  // Destinazione del valore
  writes_to: string;            // es. "availability", "selected_areas", "tags"
}
