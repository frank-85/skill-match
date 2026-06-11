import type { Question } from "../../engine/types";

interface Props {
  question: Question;
  value: string | null;
  onChange: (value: string) => void;
}

export function QuestionSingleChoice({ question, value, onChange }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-deep mb-2">{question.title}</h2>
      {question.subtitle && <p className="text-ink/70 mb-6">{question.subtitle}</p>}
      <div className="space-y-3">
        {question.options?.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition ${
                selected
                  ? "border-gold bg-gold-soft text-navy-deep"
                  : "border-navy-medium/20 hover:border-gold/50"
              }`}
              aria-pressed={selected}
            >
              {opt.icon && <span className="mr-3">{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
