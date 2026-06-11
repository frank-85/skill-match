import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import coachData from "../data/coach_questions.json";
import jobsData from "../data/jobs.json";
import {
  cancelSpeech,
  detectVoiceCapabilities,
  isMobileBrowser,
  speak,
  startListening,
  type ListenHandle,
  vibrate,
} from "./voice";
import { computeAnswerMetrics } from "./scoring";
import type {
  CoachJobScript,
  CoachQuestion,
  CoachQuestionsDataset,
  CoachSessionState,
  CoachTurn,
  RecordedAnswer,
  VoiceCapabilities,
} from "./types";
import type { Job } from "../engine/types";

const DATASET = (coachData as unknown) as CoachQuestionsDataset;
const JOBS = (jobsData as unknown as { jobs: Job[] }).jobs;

const LISTEN_TIMEOUT_MS = 90_000;
const PROCESSING_TRANSITION_MS = 600;

export function useCoachSession(jobId: string) {
  const job = useMemo(() => JOBS.find((j) => j.id === jobId) ?? null, [jobId]);
  const script: CoachJobScript | null = useMemo(
    () => DATASET.questions_by_job[jobId] ?? null,
    [jobId],
  );
  const isMobile = useMemo(() => isMobileBrowser(), []);

  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({ tts: false, stt: false });
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  const [turn, setTurn] = useState<CoachTurn>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listenStalled, setListenStalled] = useState(false);

  const listenHandleRef = useRef<ListenHandle | null>(null);
  const listenStartRef = useRef<number>(0);
  const ttsEndRef = useRef<number>(0);
  const firstWordRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTextRef = useRef<string>("");

  useEffect(() => {
    const caps = detectVoiceCapabilities();
    setCapabilities(caps);
    if (!caps.stt) setInputMode("text");
  }, []);

  const currentQuestion: CoachQuestion | null = script?.questions[currentIndex] ?? null;
  const totalQuestions = script?.questions.length ?? 0;

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    listenHandleRef.current?.stop();
    listenHandleRef.current = null;
    clearTimers();
  }, [clearTimers]);

  const finishAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setListenStalled(false);
    stopListening();
    const transcript = finalTextRef.current.trim();
    const duration = Date.now() - listenStartRef.current;
    const latency = firstWordRef.current
      ? firstWordRef.current - ttsEndRef.current
      : null;

    const metrics = computeAnswerMetrics(currentQuestion, transcript, latency);
    const allWords = transcript.split(/\s+/).filter(Boolean);
    const wordSet = new Set(transcript.toLowerCase().split(/\s+/).filter(Boolean));
    const uniqueRatio = allWords.length > 0 ? wordSet.size / allWords.length : 0;
    const lower = transcript.toLowerCase();
    const matchedKeywords = (currentQuestion.keyword_targets ?? []).filter((t) =>
      lower.includes(t.toLowerCase()),
    );

    const answer: RecordedAnswer = {
      question_id: currentQuestion.id,
      question_text: currentQuestion.text,
      question_type: currentQuestion.type,
      focus_metric: currentQuestion.focus_metric,
      transcript,
      duration_ms: duration,
      first_response_latency_ms: latency,
      word_count: allWords.length,
      unique_word_ratio: uniqueRatio,
      matched_keywords: matchedKeywords,
      metrics,
    };

    setAnswers((prev) => [...prev, answer]);
    setTurn("processing");

    setTimeout(() => {
      setTurn("turn_feedback");
      // L'utente avanza manualmente premendo "Prossima domanda →"
    }, PROCESSING_TRANSITION_MS);
  }, [currentIndex, currentQuestion, stopListening, totalQuestions]);

  const startListeningPhase = useCallback(() => {
    setListenStalled(false);
    if (inputMode === "text") {
      setTurn("listening");
      listenStartRef.current = Date.now();
      ttsEndRef.current = Date.now();
      hardTimeoutRef.current = setTimeout(finishAnswer, LISTEN_TIMEOUT_MS);
      return;
    }
    setTurn("listening");
    listenStartRef.current = Date.now();
    ttsEndRef.current = Date.now();
    finalTextRef.current = "";
    // Stall detector: 4s su mobile (Edge Android lento), 8s su desktop
    stallTimerRef.current = setTimeout(() => {
      if (finalTextRef.current.trim().length === 0) {
        setListenStalled(true);
      }
    }, isMobile ? 4000 : 8000);
    setLiveTranscript("");
    firstWordRef.current = null;

    const handle = startListening({
      onInterim: (text) => {
        if (firstWordRef.current === null) firstWordRef.current = Date.now();
        const display = finalTextRef.current.trim()
          ? finalTextRef.current.trim() + " " + text.trim()
          : text.trim();
        setLiveTranscript(display);
      },
      onFinal: (text) => {
        if (firstWordRef.current === null) firstWordRef.current = Date.now();
        const trimmed = text.trim();
        if (trimmed) finalTextRef.current += " " + trimmed;
        setLiveTranscript(finalTextRef.current.trim());
      },
      onError: (err) => {
        if (err === "no-speech") return;
        if (err === "network") return; // auto-recovery tramite restart in voice.ts
        if (err === "not-allowed" || err === "service-not-allowed") {
          stopListening();
          setInputMode("text");
          return;
        }
        setError(err);
      },
      onEnd: () => {},
    });

    if (!handle) {
      setInputMode("text");
      setTurn("listening");
      return;
    }
    listenHandleRef.current = handle;
    hardTimeoutRef.current = setTimeout(finishAnswer, LISTEN_TIMEOUT_MS);
  }, [finishAnswer, inputMode]);

  const askCurrentQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    setTurn("asking");
    const isFirst = currentIndex === 0;
    const prefix = isFirst && script ? `${script.intro_quote} ` : "";
    await speak(prefix + currentQuestion.text, {
      onEnd: () => {
        vibrate(120);
        if (isMobile && inputMode === "voice") {
          setTurn("ready_to_listen");
        } else {
          startListeningPhase();
        }
      },
      onError: () => {
        if (isMobile && inputMode === "voice") {
          setTurn("ready_to_listen");
        } else {
          startListeningPhase();
        }
      },
    });
  }, [currentIndex, currentQuestion, isMobile, inputMode, script, startListeningPhase]);

  const start = useCallback(() => {
    if (!script) {
      setError("Script per questo ruolo non trovato.");
      return;
    }
    setError(null);
    askCurrentQuestion();
  }, [askCurrentQuestion, script]);

  useEffect(() => {
    if (turn === "idle" && currentIndex > 0) {
      askCurrentQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const submitTextAnswer = useCallback(
    (text: string) => {
      finalTextRef.current = text;
      setLiveTranscript(text);
      if (firstWordRef.current === null) firstWordRef.current = Date.now();
      finishAnswer();
    },
    [finishAnswer],
  );

  const replayQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    cancelSpeech();
    stopListening();
    await speak(currentQuestion.text, {
      onEnd: () => startListeningPhase(),
    });
  }, [currentQuestion, startListeningPhase, stopListening]);

  const skipQuestion = useCallback(() => {
    finalTextRef.current = "";
    finishAnswer();
  }, [finishAnswer]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setTurn("complete");
    } else {
      setCurrentIndex(nextIndex);
      setLiveTranscript("");
      finalTextRef.current = "";
      firstWordRef.current = null;
      setTurn("idle");
    }
  }, [currentIndex, totalQuestions]);

  const abort = useCallback(() => {
    cancelSpeech();
    stopListening();
    setTurn("idle");
    setCurrentIndex(0);
    setAnswers([]);
    setLiveTranscript("");
    finalTextRef.current = "";
    firstWordRef.current = null;
    setError(null);
  }, [stopListening]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      stopListening();
    };
  }, [stopListening]);

  const state: CoachSessionState = {
    jobId,
    jobLabel: job ? `${job.company} · ${job.role}` : jobId,
    script: script ?? { intro_quote: "", questions: [] },
    currentIndex,
    turn,
    liveTranscript,
    answers,
    error,
    inputMode,
    listenStalled,
  };

  return {
    state,
    job,
    capabilities,
    currentQuestion,
    totalQuestions,
    start,
    beginListening: startListeningPhase,
    finishAnswer,
    nextQuestion,
    submitTextAnswer,
    replayQuestion,
    skipQuestion,
    abort,
    setInputMode,
  };
}
