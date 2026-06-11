interface MicButtonProps {
  state: "idle" | "listening" | "processing";
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ state, onClick, disabled }: MicButtonProps) {
  const isListening = state === "listening";
  const label =
    state === "listening" ? "Fine risposta" :
    state === "processing" ? "Sto analizzando" :
    "Avvia microfono";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || state === "processing"}
      className={[
        "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200",
        "shadow-lg border-4",
        isListening
          ? "bg-warn border-warn/40 text-white animate-pulse"
          : state === "processing"
          ? "bg-navy-medium border-navy-medium/40 text-white"
          : "bg-gold border-gold/40 text-navy-deep hover:scale-105 active:scale-95",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      aria-label={label}
    >
      {state === "processing" ? (
        <span className="text-2xl" aria-hidden>⏳</span>
      ) : isListening ? (
        <span className="text-3xl" aria-hidden>⏹</span>
      ) : (
        <span className="text-3xl" aria-hidden>🎤</span>
      )}
    </button>
  );
}
