import { useEffect, useRef } from "react";

interface LiveTranscriptProps {
  text: string;
  placeholder?: string;
  wordCount?: number;
}

export function LiveTranscript({ text, placeholder = "Inizia a parlare...", wordCount }: LiveTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [text]);

  return (
    <div className="relative">
      <div className="bg-white border-2 border-navy-medium/15 rounded-xl p-4 min-h-[160px] max-h-[260px] overflow-y-auto">
        {text.trim().length === 0 ? (
          <p className="text-navy-medium/40 italic text-sm">{placeholder}</p>
        ) : (
          <p className="text-ink leading-relaxed text-base whitespace-pre-wrap">{text}</p>
        )}
        <div ref={bottomRef} />
      </div>
      {wordCount !== undefined && wordCount > 0 && (
        <p className="absolute bottom-2 right-3 text-xs text-navy-medium/40 select-none pointer-events-none">
          {wordCount} {wordCount === 1 ? "parola" : "parole"}
        </p>
      )}
    </div>
  );
}
