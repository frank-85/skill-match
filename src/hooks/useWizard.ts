import { useState, useEffect, useMemo, useCallback } from "react";
import questionsData from "../data/questions.json";
import type { CandidateProfile, Question, MacroArea, SkillLevel, CertificationId, Availability, LanguageLevel } from "../engine/types";

const STORAGE_KEY = "skillmatch_wizard_state";

const EMPTY_PROFILE: CandidateProfile = {
  tags: {},
  experience_years: 0,
  availability: "entrambi",
  language_it_en: "solo_it",
  certifications: [],
  selected_areas: [],
};

interface WizardState {
  profile: CandidateProfile;
  currentIndex: number;
}

const QUESTIONS = (questionsData.questions as unknown) as Question[];

function loadFromStorage(): WizardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: { ...EMPTY_PROFILE }, currentIndex: 0 };
    const parsed = JSON.parse(raw) as WizardState;
    return parsed;
  } catch {
    return { profile: { ...EMPTY_PROFILE }, currentIndex: 0 };
  }
}

function shouldShowQuestion(q: Question, profile: CandidateProfile): boolean {
  if (!q.show_if) return true;
  if (q.show_if.selected_areas_contains) {
    return profile.selected_areas.includes(q.show_if.selected_areas_contains);
  }
  return true;
}

export function useWizard() {
  const [state, setState] = useState<WizardState>(loadFromStorage);

  // Persiste a ogni cambiamento
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Lista filtrata di domande in base al branching
  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => shouldShowQuestion(q, state.profile)),
    [state.profile],
  );

  const currentQuestion = visibleQuestions[state.currentIndex] ?? null;
  const totalQuestions = visibleQuestions.length;
  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex >= totalQuestions - 1;

  const next = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: Math.min(s.currentIndex + 1, visibleQuestions.length - 1),
    }));
  }, [visibleQuestions.length]);

  const prev = useCallback(() => {
    setState((s) => ({ ...s, currentIndex: Math.max(s.currentIndex - 1, 0) }));
  }, []);

  const updateProfile = useCallback((updater: (p: CandidateProfile) => CandidateProfile) => {
    setState((s) => ({ ...s, profile: updater(s.profile) }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ profile: { ...EMPTY_PROFILE }, currentIndex: 0 });
  }, []);

  // ─── Helper di scrittura mirati ai writes_to ───────────

  const writeSingleChoice = useCallback((field: string, value: string) => {
    updateProfile((p) => ({ ...p, [field]: value as Availability | LanguageLevel }));
  }, [updateProfile]);

  const writeMultiChoice = useCallback((field: string, values: string[]) => {
    if (field === "selected_areas") {
      updateProfile((p) => ({ ...p, selected_areas: values as MacroArea[] }));
    } else if (field === "certifications") {
      updateProfile((p) => ({ ...p, certifications: values as CertificationId[] }));
    } else {
      updateProfile((p) => ({ ...p, [field]: values }));
    }
  }, [updateProfile]);

  const writeSlider = useCallback((field: string, value: number) => {
    updateProfile((p) => ({ ...p, [field]: value }));
  }, [updateProfile]);

  const writeTagScale = useCallback((tagId: string, level: SkillLevel) => {
    updateProfile((p) => ({
      ...p,
      tags: { ...p.tags, [tagId]: level },
    }));
  }, [updateProfile]);

  return {
    state,
    currentQuestion,
    currentIndex: state.currentIndex,
    totalQuestions,
    isFirst,
    isLast,
    profile: state.profile,
    next,
    prev,
    reset,
    writeSingleChoice,
    writeMultiChoice,
    writeSlider,
    writeTagScale,
  };
}
