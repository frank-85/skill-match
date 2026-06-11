import type { Question } from "../../engine/types";

interface Props {
  question: Question;
  values: string[];
  onChange: (values: string[]) => void;
}

export function QuestionMultiChoice({ question, values, onChange }: Props) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      if (question.max_select && values.length >= question.max_select) return;
      onChange([...values, value]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-deep mb-2">{question.title}</h2>
      {question.subtitle && <p className="text-ink/70 mb-6">{question.subtitle}</p>}
      {question.max_select && (
        <p className="text-sm text-navy-medium mb-3">
          Selezionate: {values.length} / {question.max_select}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {question.options?.map((opt) => {
          const selected = values.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-left px-4 py-3 rounded-lg border-2 transition ${
                selected
                  ? "border-gold bg-gold-soft text-navy-deep"
                  : "border-navy-medium/20 hover:border-gold/50"
              }`}
              aria-pressed={selected}
            >
              {opt.icon && <span className="mr-2">{opt.icon}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
