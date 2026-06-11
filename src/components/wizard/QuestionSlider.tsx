import type { Question } from "../../engine/types";

interface Props {
  question: Question;
  value: number;
  onChange: (value: number) => void;
}

export function QuestionSlider({ question, value, onChange }: Props) {
  const min = question.min ?? 0;
  const max = question.max ?? 20;
  const step = question.step ?? 1;

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy-deep mb-2">{question.title}</h2>
      {question.subtitle && <p className="text-ink/70 mb-6">{question.subtitle}</p>}
      <div className="bg-gold-soft rounded-lg p-6">
        <div className="text-center mb-4">
          <span className="text-5xl font-bold text-navy-deep">{value}</span>
          <span className="text-xl text-navy-medium ml-2">{value >= max ? "+" : ""} anni</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-gold"
          aria-label={question.title}
        />
        <div className="flex justify-between text-xs text-navy-medium mt-1">
          <span>{min}</span>
          <span>{max}+</span>
        </div>
      </div>
    </div>
  );
}
