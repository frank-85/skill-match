import type { JobMatch } from "../../engine/types";
import { Button } from "../ui/Button";
import { ScoreBadge } from "../ui/ScoreBadge";

interface Props {
  match: JobMatch;
  tagLabels: Record<string, string>;
  onClose: () => void;
  onTrainWithRoleplay: () => void;
}

export function JobDetailDrawer({ match, tagLabels, onClose, onTrainWithRoleplay }: Props) {
  const { job } = match;
  const allTags = [
    ...Object.entries(job.required_tags).map(([tag, req]) => ({ tag, required: req, isRequired: true })),
    ...Object.entries(job.nice_to_have).map(([tag, req]) => ({ tag, required: req, isRequired: false })),
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-deep/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-navy-deep">{job.role}</h2>
            <p className="text-navy-medium">{job.company} · {job.location}</p>
          </div>
          <ScoreBadge score={match.score} size="lg" />
        </header>

        <section className="mb-5">
          <h3 className="font-semibold text-navy-deep mb-2">Perché candidarti</h3>
          <p className="text-ink/80">{job.why_apply}</p>
        </section>

        <section className="mb-5">
          <h3 className="font-semibold text-navy-deep mb-2">Match dettagliato</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-navy-medium border-b">
                <th className="py-2">Competenza</th>
                <th>Richiesto</th>
                <th>Tuo</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {allTags.map(({ tag, required, isRequired }) => {
                const inMatched = match.matched_tags.includes(tag);
                const gapItem = match.gap_tags.find((g) => g.tag === tag);
                const candLevel = inMatched ? required : (gapItem?.current ?? 0);
                const gap = gapItem?.gap ?? 0;
                const color = gap === 0 ? "text-green-700" : gap <= 1 ? "text-yellow-700" : "text-warn";
                return (
                  <tr key={tag} className="border-b border-navy-medium/10">
                    <td className="py-2">
                      {tagLabels[tag] ?? tag}
                      {!isRequired && <span className="text-xs text-navy-medium ml-1">(plus)</span>}
                    </td>
                    <td>{required}</td>
                    <td>{candLevel}</td>
                    <td className={color}>{gap === 0 ? "✓" : `+${gap}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </section>

        {match.gap_tags.length > 0 && (
          <section className="mb-5">
            <h3 className="font-semibold text-navy-deep mb-2">Da approfondire prima del colloquio</h3>
            <ul className="list-disc pl-5 text-ink/80 space-y-1">
              {match.gap_tags.slice(0, 5).map((g) => (
                <li key={g.tag}>{tagLabels[g.tag] ?? g.tag} — porta a livello {g.required}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Chiudi</Button>
          <Button variant="primary" onClick={onTrainWithRoleplay}>Allena questo colloquio →</Button>
        </div>
      </div>
    </div>
  );
}
