import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCoachSession } from "../coach/useCoachSession";
import { isMobileBrowser, startMicLevelMonitor } from "../coach/voice";
import { CoachShell } from "../components/coach/CoachShell";
import { QuestionDisplay } from "../components/coach/QuestionDisplay";
import { LiveTranscript } from "../components/coach/LiveTranscript";
import { TurnFeedback } from "../components/coach/TurnFeedback";
import { Button } from "../components/ui/Button";

const IS_MOBILE = isMobileBrowser();

// Barre animate da AudioContext — solo desktop (mobile: mic in uso esclusivo da STT)
function MicBars({ level }: { level: number }) {
  const heights = [30, 50, 70, 90, 70];
  const thresholds = [0.05, 0.15, 0.3, 0.5, 0.65];
  return (
    <div className="flex items-end gap-0.5 h-5 shrink-0">
      {heights.map((h, i) => (
        <div
          key={i}
          className={[
            "w-1 rounded-full transition-all duration-75",
            level >= thresholds[i] ? "bg-red-500" : "bg-red-200",
          ].join(" ")}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// Indicatore pulsante CSS-only per mobile (nessun AudioContext necessario)
function MobilePulse() {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export default function CoachPage() {
  const { jobId = "" } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const session = useCoachSession(jobId);
  const [textInput, setTextInput] = useState("");
  const [micLevel, setMicLevel] = useState(0);
  const micMonitorRef = useRef<(() => void) | null>(null);

  // Monitor livello mic via AudioContext — solo su desktop
  // Su mobile il Web Speech API tiene il mic in uso esclusivo, getUserMedia fallisce
  useEffect(() => {
    if (IS_MOBILE) return;
    if (session.state.turn === "listening" && session.state.inputMode === "voice") {
      micMonitorRef.current = startMicLevelMonitor(setMicLevel);
    } else {
      micMonitorRef.current?.();
      micMonitorRef.current = null;
      setMicLevel(0);
    }
    return () => { micMonitorRef.current?.(); micMonitorRef.current = null; };
  }, [session.state.turn, session.state.inputMode]);

  if (!session.job || session.state.script.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-navy-deep font-semibold">Ruolo non trovato.</p>
          <Button onClick={() => navigate("/results")}>Torna ai risultati</Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (session.state.turn === "complete") {
      navigate(`/coach/${jobId}/scorecard`, {
        state: { answers: session.state.answers, jobLabel: session.state.jobLabel },
        replace: true,
      });
    }
  }, [session.state.turn, session.state.answers, session.state.jobLabel, jobId, navigate]);

  if (session.state.turn === "complete") return null;

  const isIdle = session.state.turn === "idle" && session.state.currentIndex === 0 && session.state.answers.length === 0;
  const currentQ = session.currentQuestion;

  if (isIdle) {
    return (
      <CoachShell
        jobLabel={session.state.jobLabel}
        currentIndex={0}
        totalQuestions={session.totalQuestions}
        onAbort={() => navigate("/results")}
      >
        <section className="bg-white rounded-xl border border-navy-medium/15 p-6 sm:p-8 space-y-4 text-center">
          <p className="text-xs uppercase tracking-wider text-gold">Stai per iniziare</p>
          <h2 className="text-2xl font-bold text-navy-deep">{session.state.jobLabel}</h2>
          <p className="text-ink/80 leading-relaxed">{session.state.script.intro_quote}</p>
          {!session.capabilities.stt && (
            <p className="text-sm text-warn">
              Il tuo browser non supporta il microfono — userai la modalità "rispondi scrivendo".
            </p>
          )}
          {IS_MOBILE && session.capabilities.stt && (
            <div className="flex items-start gap-2 bg-navy-deep/5 border border-navy-medium/10 rounded-lg px-3 py-2 text-left">
              <span className="text-base shrink-0">🎤</span>
              <p className="text-xs text-navy-medium/70">
                Su mobile rispondi <strong>scrivendo o dettando con il microfono della tastiera</strong> — tocca il campo di testo e poi l'icona mic.
              </p>
            </div>
          )}
          <p className="text-sm text-navy-medium">
            6 domande, circa 8 minuti. Alza il volume del device, prova a non interrompere.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={session.start}>
              Inizia la simulazione →
            </Button>
          </div>
        </section>
      </CoachShell>
    );
  }

  if (!currentQ) return null;

  return (
    <CoachShell
      jobLabel={session.state.jobLabel}
      currentIndex={session.state.currentIndex}
      totalQuestions={session.totalQuestions}
      onAbort={() => navigate("/results")}
    >
      <QuestionDisplay
        question={currentQ}
        index={session.state.currentIndex}
        total={session.totalQuestions}
        onReplay={session.replayQuestion}
      />

      {session.state.turn === "asking" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-navy-deep/5 border border-navy-medium/15 rounded-xl">
          <span className="text-2xl animate-pulse shrink-0">🔊</span>
          <div>
            <p className="text-navy-deep font-semibold text-sm">Il coach sta leggendo la domanda</p>
            <p className="text-navy-medium/60 text-xs">Ascolta, poi rispondi a voce quando sei pronto</p>
          </div>
        </div>
      )}

      {/* Mobile: pulsante esplicito per avviare STT nel contesto di un gesto utente */}
      {session.state.turn === "ready_to_listen" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-navy-medium text-sm text-center">
            Quando sei pronto, tocca il pulsante e inizia a rispondere
          </p>
          <button
            onClick={session.beginListening}
            className="w-full max-w-xs bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-lg py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🎤</span>
            Tocca per rispondere
          </button>
          <button
            onClick={() => session.setInputMode("text")}
            className="text-xs text-navy-medium/50 underline underline-offset-2"
          >
            Preferisci scrivere?
          </button>
        </div>
      )}

      {(session.state.turn === "listening" || session.state.turn === "processing") && (
        <>
          {session.state.inputMode === "voice" ? (
            <div className="space-y-3">
              {/* Barra stato registrazione */}
              {session.state.turn === "processing" ? (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-navy-medium/10 border-navy-medium/20 text-navy-medium text-sm font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-navy-medium shrink-0" />
                  Elaborazione in corso...
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-red-50 border-red-200 text-red-700 text-sm font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span className="flex-1">Registrazione attiva — parla, poi clicca Fine risposta</span>
                    {IS_MOBILE ? <MobilePulse /> : <MicBars level={micLevel} />}
                  </div>
                  {/* Warning microfono basso — solo desktop, solo se nessuna parola ricevuta */}
                  {!IS_MOBILE && micLevel < 0.05 && session.state.liveTranscript.length === 0 && (
                    <p className="text-xs text-red-500/70 px-1">
                      Nessun segnale mic — avvicinati al microfono o verifica le autorizzazioni del browser.
                    </p>
                  )}
                </div>
              )}

              {/* Stall banner: 8s senza trascrizione → suggerisci testo */}
              {session.state.listenStalled && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                  <div className="flex-1 text-sm text-amber-800 space-y-1">
                    <p className="font-medium">Nessuna trascrizione rilevata</p>
                    <p className="text-amber-700/80">
                      Il riconoscimento vocale potrebbe non funzionare su questo dispositivo o browser.
                    </p>
                    <button
                      onClick={() => session.setInputMode("text")}
                      className="underline underline-offset-2 font-medium text-amber-900"
                    >
                      Passa alla modalità testo →
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript live */}
              <LiveTranscript
                text={session.state.liveTranscript}
                placeholder="La tua risposta apparirà qui mentre parli..."
                wordCount={
                  session.state.liveTranscript.trim().length > 0
                    ? session.state.liveTranscript.trim().split(/\s+/).filter(Boolean).length
                    : undefined
                }
              />

              {/* Pulsanti azione */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  onClick={session.finishAnswer}
                  disabled={session.state.turn === "processing"}
                  className="flex-1 sm:flex-none"
                >
                  {session.state.turn === "processing" ? "Elaborazione..." : "Fine risposta →"}
                </Button>
                <div className="flex items-center gap-3 justify-center sm:justify-start pl-1">
                  <button
                    onClick={session.replayQuestion}
                    disabled={session.state.turn === "processing"}
                    className="text-xs text-navy-medium/60 hover:text-navy-medium underline underline-offset-2 disabled:opacity-40 transition-colors"
                  >
                    Riascolta domanda
                  </button>
                  <span className="text-navy-medium/30 text-xs">·</span>
                  <button
                    onClick={session.skipQuestion}
                    disabled={session.state.turn === "processing"}
                    className="text-xs text-navy-medium/60 hover:text-navy-medium underline underline-offset-2 disabled:opacity-40 transition-colors"
                  >
                    Salta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Hint tastiera vocale — solo mobile */}
              {IS_MOBILE && (
                <div className="flex items-center gap-2 px-3 py-2 bg-navy-deep/5 border border-navy-medium/10 rounded-lg">
                  <span className="text-lg shrink-0">🎤</span>
                  <p className="text-xs text-navy-medium/70">
                    Tocca il campo, poi usa il{" "}
                    <strong className="text-navy-medium">microfono sulla tastiera</strong>{" "}
                    per dettare la risposta a voce.
                  </p>
                </div>
              )}
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={IS_MOBILE ? "Tocca qui, poi usa il mic sulla tastiera..." : "Scrivi la tua risposta..."}
                rows={IS_MOBILE ? 6 : 8}
                autoFocus
                className="w-full bg-white border border-navy-medium/20 rounded-xl p-4 text-ink text-base focus:border-gold outline-none resize-none"
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTextInput("");
                    session.skipQuestion();
                  }}
                >
                  Salta
                </Button>
                <Button
                  variant="primary"
                  disabled={textInput.trim().length === 0}
                  onClick={() => {
                    session.submitTextAnswer(textInput.trim());
                    setTextInput("");
                  }}
                >
                  Fine risposta →
                </Button>
              </div>
              {/* Toggle voce opzionale — solo mobile, per chi ha Web Speech funzionante */}
              {IS_MOBILE && session.capabilities.stt && (
                <p className="text-center text-xs text-navy-medium/40">
                  <button
                    onClick={() => session.setInputMode("voice")}
                    className="underline underline-offset-2"
                  >
                    Prova modalità voce
                  </button>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {session.state.turn === "turn_feedback" && session.state.answers.length > 0 && (
        <TurnFeedback
          answer={session.state.answers[session.state.answers.length - 1]}
          onNext={session.nextQuestion}
          isLast={session.state.currentIndex + 1 >= session.totalQuestions}
        />
      )}

      {session.state.error && (
        <div className="bg-warn/10 border border-warn/30 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-warn mt-0.5 shrink-0">⚠</span>
          <div className="flex-1 space-y-1">
            <p className="text-warn text-sm font-medium">
              {session.state.error === "not-allowed" || session.state.error === "service-not-allowed"
                ? "Microfono non autorizzato dal browser."
                : session.state.error === "network"
                ? "Errore di rete nel riconoscimento vocale."
                : `Errore voce: ${session.state.error}`}
            </p>
            {session.state.inputMode === "voice" && (
              <button
                onClick={() => session.setInputMode("text")}
                className="text-xs text-warn underline underline-offset-2"
              >
                Passa alla modalità testo →
              </button>
            )}
          </div>
        </div>
      )}
    </CoachShell>
  );
}
