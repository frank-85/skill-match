import type { JobMatch } from "../../engine/types";
import { ScoreBadge } from "../ui/ScoreBadge";
import { Button } from "../ui/Button";

interface Props {
  match: JobMatch;
  onOpenDetail: () => void;
  onTrainWithRoleplay: () => void;
}

export function JobMatchCard({ match, onOpenDetail, onTrainWithRoleplay }: Props) {
  const { job } = match;
  return (
    <article className="bg-white rounded-xl border-2 border-navy-medium/10 p-6 hover:border-gold/40 transition">
      <header className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-navy-deep">{job.role}</h3>
          <p className="text-navy-medium">{job.company} · {job.location}</p>
          <p className="text-xs text-ink/60 mt-1">
            {job.contract === "p_iva" ? "P.IVA / freelance" : job.contract.replace("_", " ")}
          </p>
        </div>
        <ScoreBadge score={match.score} size="lg" />
      </header>

      <div className="space-y-2 text-sm">
        <p className="text-navy-deep">
          <span aria-hidden="true">✓ </span>{match.why_match}
        </p>
        <p className="text-warn">
          <span aria-hidden="true">→ </span>{match.gap_narrative}
        </p>
      </div>

      <div className="mt-5 flex gap-2 flex-wrap">
        <Button variant="ghost" onClick={onOpenDetail}>Dettagli →</Button>
        <Button variant="secondary" onClick={onTrainWithRoleplay}>Allena questo colloquio</Button>
      </div>
    </article>
  );
}
