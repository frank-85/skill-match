import { useMemo } from "react";
import jobsData from "../data/jobs.json";
import skillsData from "../data/skills.json";
import { matchProfileToJobs } from "../engine/scoring";
import { buildWhyMatch, buildGapNarrative } from "../engine/narrative";
import type { CandidateProfile, Job, JobMatch, SkillsTaxonomy } from "../engine/types";

const JOBS = (jobsData.jobs as unknown) as Job[];
const SKILLS = (skillsData as unknown) as SkillsTaxonomy;

const TAG_LABELS: Record<string, string> = SKILLS.tags.reduce(
  (acc, t) => ({ ...acc, [t.id]: t.label }),
  {},
);

export function useMatch(profile: CandidateProfile, topN: number = 3) {
  const results: JobMatch[] = useMemo(() => {
    const raw = matchProfileToJobs(profile, JOBS);
    return raw.slice(0, topN).map((m) => ({
      ...m,
      why_match: buildWhyMatch(m, TAG_LABELS),
      gap_narrative: buildGapNarrative(m, TAG_LABELS),
    }));
  }, [profile, topN]);

  return { results, tagLabels: TAG_LABELS, allMatches: matchProfileToJobs(profile, JOBS) };
}
