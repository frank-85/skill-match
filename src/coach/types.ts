export type CoachTurn =
  | "idle"
  | "asking"
  | "ready_to_listen" // mobile: TTS finito, aspetta tap utente prima di avviare STT
  | "listening"
  | "processing"
  | "turn_feedback"
  | "complete";

export type FocusMetric = "presenza" | "concisione" | "specificita" | "struttura" | "energia";

export type QuestionType =
  | "warmup"
  | "technical_role"
  | "skill_required"
  | "behavioral_star"
  | "brand_knowledge"
  | "closing";

export interface CoachQuestion {
  id: string;
  type: QuestionType;
  text: string;
  focus_metric: FocusMetric;
  keyword_targets?: string[];
}

export interface CoachJobScript {
  intro_quote: string;
  questions: CoachQuestion[];
}

export interface CoachQuestionsDataset {
  questions_by_job: Record<string, CoachJobScript>;
}

export interface AnswerMetrics {
  presenza: number;
  concisione: number;
  specificita: number;
  struttura: number;
  energia: number;
}

export interface RecordedAnswer {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  focus_metric: FocusMetric;
  transcript: string;
  duration_ms: number;
  first_response_latency_ms: number | null;
  word_count: number;
  unique_word_ratio: number;
  matched_keywords: string[];
  metrics: AnswerMetrics;
}

export interface SessionScore {
  overall: number;
  by_metric: AnswerMetrics;
  strongest_metric: FocusMetric;
  weakest_metric: FocusMetric;
}

export interface CoachSessionState {
  jobId: string;
  jobLabel: string;
  script: CoachJobScript;
  currentIndex: number;
  turn: CoachTurn;
  liveTranscript: string;
  answers: RecordedAnswer[];
  error: string | null;
  inputMode: "voice" | "text";
  listenStalled: boolean; // true se 8s di ascolto senza nessuna trascrizione
}

export interface VoiceCapabilities {
  tts: boolean;
  stt: boolean;
}
