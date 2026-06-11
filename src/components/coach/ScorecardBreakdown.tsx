import { useState } from "react";
import type { RecordedAnswer } from "../../coach/types";
import { metricLabel } from "../../coach/narrative";

interface Props {
  answers: RecordedAnswer[];
}

export function ScorecardBreakdown({ answers }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white rounded-xl border border-navy-medium/15 p-6 space-y-3">
      <header>
        <p className="text-xs uppercase tracking-wider text-navy-medium">Risposta per risposta</p>
      </header>
      <ul className="divide-y divide-navy-medium/10">
        {answers.map((a, i) => {
          const open = openIndex === i;
          const focusScore = a.metrics[a.focus_metric];
          return (
            <li key={a.question_id}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left py-3 flex justify-between items-center hover:bg-bg/40"
                aria-expanded={open}
              >
                <span className="text-navy-deep">
                  <span className="text-xs text-navy-medium mr-2">Q{i + 1}</span>
                  {a.question_text.length > 70 ? a.question_text.slice(0, 67) + "…" : a.question_text}
                </span>
                <span className="text-gold font-bold ml-3 shrink-0">{focusScore}%</span>
              </button>
              {open && (
                <div className="pl-8 pr-2 pb-4 space-y-2 text-sm">
                  <p className="text-navy-medium">Focus: {metricLabel(a.focus_metric)}</p>
                  <div className="bg-bg/60 rounded p-3 text-ink leading-relaxed whitespace-pre-wrap">
                    {a.transcript || <span className="italic text-navy-medium">(risposta saltata)</span>}
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    {(["presenza","concisione","specificita","struttura","energia"] as const).map((m) => (
                      <div key={m} className="text-center">
                        <p className="text-navy-medium">{metricLabel(m)}</p>
                        <p className="font-semibold text-navy-deep">{a.metrics[m]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
