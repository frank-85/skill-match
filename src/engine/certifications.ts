import type { CandidateProfile, CertificationId, LanguageLevel, SkillLevel } from "./types";

// Mapping certificazione → tag con bonus +1
const CERT_TAG_BONUS: Record<CertificationId, string[]> = {
  google_ads: ["biz.seo_sem", "biz.analytics_marketing"],
  hubspot: ["biz.email_marketing", "sell.cold_outreach"],
  microsoft_office: ["ops.amministrazione", "tech.data"],
  aws_azure: ["tech.devops"],
  pmp: ["ops.project_mgmt"],
  salesforce_admin: ["sell.tech_sales"],
  adobe_certified: ["crea.graphic_design"],
  cambridge_toefl_ielts: [], // gestita separatamente (promozione lingua)
  ecdl: ["tech.data"],
  altro: [],
};

const LANGUAGE_PROMOTION: Record<LanguageLevel, LanguageLevel> = {
  solo_it: "it_en_base",
  it_en_base: "it_en_fluent",
  it_en_fluent: "it_en_fluent", // già massimo
};

const LEVEL_CAP: SkillLevel = 5;

/**
 * Applica i bonus delle certificazioni al profilo:
 * - Tag bonus: +1 livello (cappato a 5)
 * - Lingua: promuove di un livello se cert linguistica presente
 *
 * Ritorna un NUOVO profilo (immutabile).
 */
export function applyCertificationBonus(profile: CandidateProfile): CandidateProfile {
  const boostedTags = { ...profile.tags };

  for (const certId of profile.certifications) {
    const bonusTags = CERT_TAG_BONUS[certId] ?? [];
    for (const tag of bonusTags) {
      const current = boostedTags[tag] ?? 0;
      const next = Math.min(LEVEL_CAP, current + 1) as SkillLevel;
      boostedTags[tag] = next;
    }
  }

  const hasLanguageCert = profile.certifications.includes("cambridge_toefl_ielts");
  const language = hasLanguageCert
    ? LANGUAGE_PROMOTION[profile.language_it_en]
    : profile.language_it_en;

  return {
    ...profile,
    tags: boostedTags,
    language_it_en: language,
  };
}
