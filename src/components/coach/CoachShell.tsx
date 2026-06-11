import type { ReactNode } from "react";
import { ProgressBar } from "../ui/ProgressBar";

interface Props {
  jobLabel: string;
  currentIndex: number;
  totalQuestions: number;
  onAbort: () => void;
  children: ReactNode;
}

export function CoachShell({ jobLabel, currentIndex, totalQuestions, onAbort, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-deep text-bg px-6 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-gold-soft">Coach</p>
            <h1 className="font-semibold text-sm">{jobLabel}</h1>
          </div>
          <button
            type="button"
            onClick={onAbort}
            className="text-xs text-gold-soft hover:text-gold underline"
          >
            Esci
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-2">
          <ProgressBar current={currentIndex} total={totalQuestions} />
        </div>
      </header>
      <main className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full space-y-5">
        {children}
      </main>
    </div>
  );
}
