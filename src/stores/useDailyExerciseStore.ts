import type { DailyExerciseRewards } from "@/src/api/practice/useMarkDailyExercise";
import { create } from "zustand";

export interface DailyExerciseSession {
  dailyExerciseId: string;
  questionCount: number;
  answers: (string | null)[];
  currentQuestionIndex: number;
  elapsedSeconds: number;
  revealedHints: Record<number, number>;
}

interface DailyExerciseStore {
  activeSession: DailyExerciseSession | null;
  lastRewards: DailyExerciseRewards | null;
  startSession: (dailyExerciseId: string, questionCount: number) => void;
  setAnswer: (questionIndex: number, answer: string) => void;
  setCurrentQuestion: (index: number) => void;
  setElapsedSeconds: (dailyExerciseId: string, seconds: number) => void;
  setRevealedHints: (
    dailyExerciseId: string,
    revealedHints: Record<number, number>,
  ) => void;
  clearSession: () => void;
  getSession: (dailyExerciseId: string) => DailyExerciseSession | null;
  setLastRewards: (rewards: DailyExerciseRewards | null) => void;
}

export const useDailyExerciseStore = create<DailyExerciseStore>((set, get) => ({
  activeSession: null,
  lastRewards: null,

  startSession: (dailyExerciseId, questionCount) => {
    const existing = get().activeSession;
    if (existing?.dailyExerciseId === dailyExerciseId) return;
    set({
      activeSession: {
        dailyExerciseId,
        questionCount,
        answers: new Array(questionCount).fill(null),
        currentQuestionIndex: 0,
        elapsedSeconds: 0,
        revealedHints: {},
      },
    });
  },

  setAnswer: (questionIndex, answer) => {
    set((state) => {
      if (!state.activeSession) return state;
      const newAnswers = [...state.activeSession.answers];
      newAnswers[questionIndex] = answer;
      return { activeSession: { ...state.activeSession, answers: newAnswers } };
    });
  },

  setCurrentQuestion: (index) => {
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: { ...state.activeSession, currentQuestionIndex: index },
      };
    });
  },

  setElapsedSeconds: (dailyExerciseId, seconds) => {
    set((state) => {
      if (
        !state.activeSession ||
        state.activeSession.dailyExerciseId !== dailyExerciseId
      ) {
        return state;
      }
      return {
        activeSession: { ...state.activeSession, elapsedSeconds: seconds },
      };
    });
  },

  setRevealedHints: (dailyExerciseId, revealedHints) => {
    set((state) => {
      if (
        !state.activeSession ||
        state.activeSession.dailyExerciseId !== dailyExerciseId
      ) {
        return state;
      }
      return {
        activeSession: { ...state.activeSession, revealedHints },
      };
    });
  },

  clearSession: () => set({ activeSession: null }),

  getSession: (dailyExerciseId) => {
    const s = get().activeSession;
    return s?.dailyExerciseId === dailyExerciseId ? s : null;
  },

  setLastRewards: (rewards) => set({ lastRewards: rewards }),
}));
