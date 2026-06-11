import type { CoachQuestion } from "../../coach/types";

interface Props {
  question: CoachQuestion;
  index: number;
  total: number;
  onReplay: () => void;
}

export function QuestionDisplay({ question, index, total, onReplay }: Props) {
  return (
    <section className="bg-white rounded-xl border-2 border-navy-medium/15 p-5 sm:p-6">
      <header className="flex justify-between items-center text-xs uppercase tracking-wider text-navy-medium mb-3">
        <span>Domanda {index + 1} di {total}</span>
        <span className="text-gold font-semibold">{labelByType(question.type)}</span>
      </header>
      <p className="text-lg sm:text-xl text-navy-deep leading-snug font-medium">
        {question.text}
      </p>
      <button
        type="button"
        onClick={onReplay}
        className="mt-4 text-sm text-navy-medium hover:text-navy-deep underline"
      >
        🔊 Riascolta la domanda
      </button>
    </section>
  );
}

function labelByType(t: CoachQuestion["type"]): string {
  switch (t) {
    case "warmup": return "Apertura";
    case "technical_role": return "Tecnica";
    case "skill_required": return "Competenza chiave";
    case "behavioral_star": return "Comportamentale";
    case "brand_knowledge": return "Conoscenza brand";
    case "closing": return "Chiusura";
  }
}
