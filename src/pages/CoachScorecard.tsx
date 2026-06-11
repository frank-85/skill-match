import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { computeSessionScore } from "../coach/scoring";
import { strengthNarrative, improvementNarrative } from "../coach/narrative";
import { ScorecardChart } from "../components/coach/ScorecardChart";
import { ScorecardBreakdown } from "../components/coach/ScorecardBreakdown";
import { ScoreBadge } from "../components/ui/ScoreBadge";
import { Button } from "../components/ui/Button";
import type { RecordedAnswer } from "../coach/types";

interface LocationState {
  answers: RecordedAnswer[];
  jobLabel: string;
}

export default function CoachScorecardPage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const answers = state?.answers ?? [];
  const jobLabel = state?.jobLabel ?? "Sessione coach";

  const sessionScore = useMemo(() => computeSessionScore(answers), [answers]);

  if (answers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-navy-deep font-semibold">Nessuna sessione completata.</p>
          <Button onClick={() => navigate("/results")}>Torna ai risultati</Button>
        </div>
      </div>
    );
  }

  const totalWords = answers.reduce((sum, a) => sum + a.word_count, 0);
  const totalDurationMs = answers.reduce((sum, a) => sum + a.duration_ms, 0);
  const totalMinutes = Math.round(totalDurationMs / 60000);

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-deep text-bg px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-gold-soft">Coach Scorecard</p>
          <h1 className="font-semibold text-lg">{jobLabel}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <section className="bg-white rounded-xl border border-navy-medium/15 p-6 text-center space-y-3">
          <p className="text-xs uppercase tracking-wider text-navy-medium">Punteggio complessivo</p>
          <ScoreBadge score={sessionScore.overall / 100} size="lg" />
          <p className="text-sm text-navy-medium">
            {answers.length} risposte · {totalWords} parole · {totalMinutes} min
          </p>
        </section>

        <ScorecardChart score={sessionScore} />

        <section className="bg-white rounded-xl border border-navy-medium/15 p-6 space-y-3">
          <p className="text-xs uppercase tracking-wider text-navy-medium">Insight</p>
          <p className="text-navy-deep">{strengthNarrative(sessionScore)}</p>
          <p className="text-warn">{improvementNarrative(sessionScore)}</p>
        </section>

        <ScorecardBreakdown answers={answers} />

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="ghost" onClick={() => navigate(`/coach/${jobId}`)}>
            Riprova questo coach
          </Button>
          <Button variant="primary" onClick={() => navigate("/results")}>
            Torna ai risultati
          </Button>
        </div>
      </main>
    </div>
  );
}
