import type { PracticeRewards } from "@/src/api/practice/useMarkAnswers";
import { create } from "zustand";

/**
 * Tracks the in-progress quiz state for a practice session.
 * All question/marking data lives on the server (React Query cache).
 */
export interface ActiveSession {
  practiceId: string;
  questionCount: number;
  /** One string per question (selected option text for MC). null = not answered yet. */
  answers: (string | null)[];
  currentQuestionIndex: number;
  /** Elapsed seconds in this practice session */
  elapsedSeconds: number;
  /** How many hints have been revealed per question index */
  revealedHints: Record<number, number>;
}

interface PracticeStore {
  /** Map of practiceId -> ActiveSession to track multiple practices */
  sessions: Record<string, ActiveSession>;
  lastRewards: PracticeRewards | null;
  startSession: (practiceId: string, questionCount: number) => void;
  setAnswer: (
    practiceId: string,
    questionIndex: number,
    answer: string,
  ) => void;
  setCurrentQuestion: (practiceId: string, index: number) => void;
  setElapsedSeconds: (practiceId: string, seconds: number) => void;
  setRevealedHints: (
    practiceId: string,
    revealedHints: Record<number, number>,
  ) => void;
  clearSession: (practiceId: string) => void;
  getSession: (practiceId: string) => ActiveSession | null;
  setLastRewards: (rewards: PracticeRewards | null) => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  sessions: {},
  lastRewards: null,

  startSession: (practiceId, questionCount) => {
    const existing = get().sessions[practiceId];
    if (existing) return; // Session already exists, keep it
    set((state) => ({
      sessions: {
        ...state.sessions,
        [practiceId]: {
          practiceId,
          questionCount,
          answers: new Array(questionCount).fill(null),
          currentQuestionIndex: 0,
          elapsedSeconds: 0,
          revealedHints: {},
        },
      },
    }));
  },

  setAnswer: (practiceId, questionIndex, answer) => {
    set((state) => {
      const session = state.sessions[practiceId];
      if (!session) return state;
      const newAnswers = [...session.answers];
      newAnswers[questionIndex] = answer;
      return {
        sessions: {
          ...state.sessions,
          [practiceId]: { ...session, answers: newAnswers },
        },
      };
    });
  },

  setCurrentQuestion: (practiceId, index) => {
    set((state) => {
      const session = state.sessions[practiceId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [practiceId]: { ...session, currentQuestionIndex: index },
        },
      };
    });
  },

  setElapsedSeconds: (practiceId, seconds) => {
    set((state) => {
      const session = state.sessions[practiceId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [practiceId]: { ...session, elapsedSeconds: seconds },
        },
      };
    });
  },

  setRevealedHints: (practiceId, revealedHints) => {
    set((state) => {
      const session = state.sessions[practiceId];
      if (!session) return state;
      return {
        sessions: {
          ...state.sessions,
          [practiceId]: { ...session, revealedHints },
        },
      };
    });
  },

  clearSession: (practiceId) => {
    set((state) => {
      const newSessions = { ...state.sessions };
      delete newSessions[practiceId];
      return { sessions: newSessions };
    });
  },

  getSession: (practiceId) => {
    return get().sessions[practiceId] ?? null;
  },

  setLastRewards: (rewards) => set({ lastRewards: rewards }),
}));
