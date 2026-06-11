import type { SessionScore, FocusMetric } from "../../coach/types";
import { metricLabel } from "../../coach/narrative";

interface Props {
  score: SessionScore;
}

const METRICS_ORDER: FocusMetric[] = ["presenza", "concisione", "specificita", "struttura", "energia"];

export function ScorecardChart({ score }: Props) {
  return (
    <section className="bg-white rounded-xl border border-navy-medium/15 p-6 space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wider text-navy-medium">Dettaglio metriche</p>
      </header>
      <div className="space-y-3">
        {METRICS_ORDER.map((m) => {
          const v = score.by_metric[m];
          const isStrongest = m === score.strongest_metric;
          const isWeakest = m === score.weakest_metric;
          return (
            <div key={m}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-navy-deep">
                  {metricLabel(m)}
                  {isStrongest && <span className="ml-1 text-gold" aria-label="punto di forza">★</span>}
                  {isWeakest && <span className="ml-1 text-warn" aria-label="da rafforzare">↑</span>}
                </span>
                <span className="text-navy-medium font-semibold">{v}%</span>
              </div>
              <div className="w-full h-3 bg-gold-soft rounded-full overflow-hidden" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={isWeakest ? "h-full bg-warn transition-all duration-700" : "h-full bg-gold transition-all duration-700"}
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
