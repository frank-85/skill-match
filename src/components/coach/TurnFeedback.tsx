import type { RecordedAnswer } from "../../coach/types";
import { turnFeedback } from "../../coach/narrative";
import { Button } from "../ui/Button";

interface Props {
  answer: RecordedAnswer;
  onNext: () => void;
  isLast: boolean;
}

export function TurnFeedback({ answer, onNext, isLast }: Props) {
  return (
    <section className="bg-white rounded-xl border-2 border-gold/40 p-6 text-center space-y-4">
      <div className="text-5xl" aria-hidden>✓</div>
      <p className="text-lg text-navy-deep leading-relaxed">{turnFeedback(answer)}</p>
      <Button variant="primary" onClick={onNext}>
        {isLast ? "Vedi la scorecard →" : "Prossima domanda →"}
      </Button>
    </section>
  );
}
