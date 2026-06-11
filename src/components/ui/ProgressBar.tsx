interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-navy-medium mb-1">
        <span>Domanda {current + 1} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gold-soft rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
