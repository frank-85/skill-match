import type { ReactNode } from "react";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";

interface Props {
  currentIndex: number;
  totalQuestions: number;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canProceed: boolean;
  children: ReactNode;
}

export function WizardShell({
  currentIndex, totalQuestions, isFirst, isLast,
  onPrev, onNext, onSubmit, canProceed, children,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-deep text-bg px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="font-bold text-xl">Skill-Match</h1>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <ProgressBar current={currentIndex} total={totalQuestions} />
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {children}
        </div>
      </main>

      <footer className="bg-bg border-t border-navy-medium/10 px-6 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button variant="ghost" onClick={onPrev} disabled={isFirst}>
            ← Indietro
          </Button>
          {isLast ? (
            <Button variant="primary" onClick={onSubmit} disabled={!canProceed}>
              Calcola il match →
            </Button>
          ) : (
            <Button variant="primary" onClick={onNext} disabled={!canProceed}>
              Avanti →
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
