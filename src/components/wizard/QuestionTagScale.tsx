import type { Question, SkillLevel } from "../../engine/types";

interface Props {
  question: Question;
  values: Record<string, SkillLevel>;
  onChange: (tag: string, level: SkillLevel) => void;
}

const LEVELS: SkillLevel[] = [0, 1, 2, 3, 4, 5];

export function QuestionTagScale({ question, values, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-deep mb-2">{question.title}</h2>
      {question.subtitle && <p className="text-ink/70 mb-6">{question.subtitle}</p>}
      <div className="space-y-4">
        {question.items?.map((item) => {
          const current = values[item.tag] ?? 0;
          return (
            <div key={item.tag} className="p-3 rounded-lg border border-navy-medium/15">
              <div className="font-medium mb-2">{item.label}</div>
              <div className="flex gap-1" role="radiogroup" aria-label={item.label}>
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onChange(item.tag, lvl)}
                    className={`flex-1 py-2 text-sm rounded transition ${
                      current === lvl
                        ? "bg-gold text-navy-deep font-semibold"
                        : "bg-gold-soft/40 hover:bg-gold-soft text-navy-medium"
                    }`}
                    aria-pressed={current === lvl}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              {question.scale_labels && (
                <div className="text-xs text-navy-medium mt-1 text-right">
                  {question.scale_labels[current]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
