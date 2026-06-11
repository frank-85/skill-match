import { useEffect, useState } from "react";

interface ScoreBadgeProps {
  score: number; // 0-1
  size?: "sm" | "lg";
}

export function ScoreBadge({ score, size = "lg" }: ScoreBadgeProps) {
  const target = Math.round(score * 100);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplayed(target);
      return;
    }
    const duration = 500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplayed(Math.round(target * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const sizeClass = size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <span className={`font-bold text-gold ${sizeClass}`}>
      {displayed}%
    </span>
  );
}
