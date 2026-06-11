import type { Question } from "../../engine/types";

interface Props {
  question: Question;
}

export function QuestionIntroText({ question }: Props) {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold text-navy-deep mb-4">{question.title}</h2>
      {question.subtitle && (
        <p className="text-lg text-ink/80 max-w-xl mx-auto">{question.subtitle}</p>
      )}
    </div>
  );
}
