import type { CandidateProfile, MacroArea, SkillsTaxonomy } from "../../engine/types";
import skillsData from "../../data/skills.json";

const SKILLS = (skillsData as unknown) as SkillsTaxonomy;

interface Props {
  profile: CandidateProfile;
}

/**
 * Calcola un "punteggio area" semplice: media dei tag dell'area presenti nel profilo (>0).
 * Ritorna percentuale 0-100.
 */
function areaScore(profile: CandidateProfile, area: MacroArea): number {
  const tagsInArea = SKILLS.tags.filter((t) => t.area === area);
  const presentLevels: number[] = tagsInArea
    .map((t) => (profile.tags[t.id] ?? 0) as number)
    .filter((v) => v > 0);
  if (presentLevels.length === 0) return 0;
  const avg = presentLevels.reduce((a, b) => a + b, 0) / presentLevels.length;
  return Math.round((avg / 5) * 100);
}

export function ProfileSummary({ profile }: Props) {
  const areas = profile.selected_areas;

  return (
    <section className="bg-white rounded-xl p-6 border border-navy-medium/10">
      <h2 className="text-lg font-semibold text-navy-deep mb-3">Il tuo profilo</h2>
      <p className="text-sm text-ink/70 mb-4">
        {profile.experience_years}{profile.experience_years >= 20 ? "+" : ""} anni · {profile.availability === "p_iva" ? "P.IVA" : profile.availability === "dipendente" ? "Dipendente" : "Entrambi"} · {profile.language_it_en.replace("_", " ")}
      </p>
      <div className="space-y-2">
        {areas.map((a) => {
          const pct = areaScore(profile, a);
          return (
            <div key={a}>
              <div className="flex justify-between text-sm">
                <span className="text-navy-deep">{SKILLS.areas[a].icon} {SKILLS.areas[a].label}</span>
                <span className="text-navy-medium">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-gold-soft rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
