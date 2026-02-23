'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User, ScheduleEntry, Homework, HomeworkStep, FlashcardDeck, Flashcard,
  Quiz, QuizQuestion, TimerSession, Subject, Grade, Note, DailyStats,
  StudyPlan, Country, UserSettings
} from '@/lib/types';
import { generateId } from '@/lib/utils';
import { getLevelFromXP, XP_VALUES } from '@/lib/gamification';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  signup: (data: { email: string; name: string; school: string; country: Country; goal: string }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  completeOnboarding: () => void;

  // XP & Gamification
  addXP: (amount: number) => void;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  unlockReward: (rewardId: string) => void;
  updateStreak: () => void;

  // Schedule
  schedule: ScheduleEntry[];
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  deleteScheduleEntry: (id: string) => void;

  // Homework
  homework: Homework[];
  addHomework: (hw: Omit<Homework, 'id' | 'createdAt' | 'steps'>) => void;
  updateHomework: (id: string, updates: Partial<Homework>) => void;
  deleteHomework: (id: string) => void;
  addHomeworkStep: (homeworkId: string, text: string) => void;
  toggleHomeworkStep: (homeworkId: string, stepId: string) => void;

  // Flashcards
  decks: FlashcardDeck[];
  addDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt' | 'lastStudied' | 'cards'>) => string;
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => void;
  deleteDeck: (id: string) => void;
  addCard: (deckId: string, front: string, back: string) => void;
  addCards: (deckId: string, cards: { front: string; back: string }[]) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  reviewCard: (deckId: string, cardId: string, quality: number) => void;

  // Quizzes
  quizzes: Quiz[];
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'completedAt' | 'score'>) => string;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  completeQuiz: (id: string, answers: Record<string, string>) => void;

  // Timer
  timerSessions: TimerSession[];
  addTimerSession: (session: Omit<TimerSession, 'id'>) => void;

  // Grades
  subjects: Subject[];
  addSubject: (name: string, color: string) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
  deleteGrade: (subjectId: string, gradeId: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Stats
  dailyStats: DailyStats[];
  updateDailyStats: (updates: Partial<DailyStats>) => void;

  // Study Plans
  studyPlans: StudyPlan[];
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => void;
  updateStudyPlanDay: (planId: string, date: string, completed: boolean) => void;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ============ AUTH ============
      user: null,
      isAuthenticated: false,

      login: (email, name) => {
        set({
          isAuthenticated: true,
          user: {
            id: generateId(),
            email,
            name,
            avatar: '',
            school: '',
            country: 'US',
            tier: 'free',
            aiRequestsToday: 0,
            aiRequestsResetDate: getTodayString(),
            goal: '',
            createdAt: new Date().toISOString(),
            xp: 0,
            level: 1,
            streak: 0,
            lastStudyDate: '',
            points: 0,
            unlockedRewards: [],
            onboardingCompleted: false,
            settings: {
              theme: 'light',
              language: 'en',
              notifications: true,
              pomodoroWork: 25,
              pomodoroBreak: 5,
              pomodoreLongBreak: 15,
              calendarIntegration: 'none',
            },
          },
        });
      },

      signup: (data) => {
        set({
          isAuthenticated: true,
          user: {
            id: generateId(),
            email: data.email,
            name: data.name,
            avatar: '',
            school: data.school,
            country: data.country,
            tier: 'free',
            aiRequestsToday: 0,
            aiRequestsResetDate: getTodayString(),
            goal: data.goal,
            createdAt: new Date().toISOString(),
            xp: 0,
            level: 1,
            streak: 0,
            lastStudyDate: '',
            points: 0,
            unlockedRewards: [],
            onboardingCompleted: false,
            settings: {
              theme: 'light',
              language: 'en',
              notifications: true,
              pomodoroWork: 25,
              pomodoroBreak: 5,
              pomodoreLongBreak: 15,
              calendarIntegration: 'none',
            },
          },
        });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      updateSettings: (updates) => set((state) => ({
        user: state.user ? {
          ...state.user,
          settings: { ...state.user.settings, ...updates },
        } : null,
      })),

      completeOnboarding: () => set((state) => ({
        user: state.user ? { ...state.user, onboardingCompleted: true } : null,
      })),

      // ============ XP & GAMIFICATION ============
      addXP: (amount) => set((state) => {
        if (!state.user) return {};
        const newXP = state.user.xp + amount;
        const newLevel = getLevelFromXP(newXP);
        return {
          user: { ...state.user, xp: newXP, level: newLevel, points: state.user.points + Math.floor(amount / 2) },
        };
      }),

      addPoints: (amount) => set((state) => ({
        user: state.user ? { ...state.user, points: state.user.points + amount } : null,
      })),

      spendPoints: (amount) => {
        const state = get();
        if (!state.user || state.user.points < amount) return false;
        set({ user: { ...state.user, points: state.user.points - amount } });
        return true;
      },

      unlockReward: (rewardId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          unlockedRewards: [...state.user.unlockedRewards, rewardId],
        } : null,
      })),

      updateStreak: () => set((state) => {
        if (!state.user) return {};
        const today = getTodayString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.user.lastStudyDate === today) return {};

        let newStreak = state.user.streak;
        if (state.user.lastStudyDate === yesterdayStr) {
          newStreak += 1;
        } else if (state.user.lastStudyDate !== today) {
          newStreak = 1;
        }

        return {
          user: { ...state.user, streak: newStreak, lastStudyDate: today },
        };
      }),

      // ============ SCHEDULE ============
      schedule: [],

      addScheduleEntry: (entry) => set((state) => ({
        schedule: [...state.schedule, { ...entry, id: generateId() }],
      })),

      updateScheduleEntry: (id, updates) => set((state) => ({
        schedule: state.schedule.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      })),

      deleteScheduleEntry: (id) => set((state) => ({
        schedule: state.schedule.filter((e) => e.id !== id),
      })),

      // ============ HOMEWORK ============
      homework: [],

      addHomework: (hw) => set((state) => ({
        homework: [...state.homework, { ...hw, id: generateId(), createdAt: new Date().toISOString(), steps: [] }],
      })),

      updateHomework: (id, updates) => set((state) => ({
        homework: state.homework.map((h) => (h.id === id ? { ...h, ...updates } : h)),
      })),

      deleteHomework: (id) => set((state) => ({
        homework: state.homework.filter((h) => h.id !== id),
      })),

      addHomeworkStep: (homeworkId, text) => set((state) => ({
        homework: state.homework.map((h) =>
          h.id === homeworkId
            ? { ...h, steps: [...h.steps, { id: generateId(), text, completed: false }] }
            : h
        ),
      })),

      toggleHomeworkStep: (homeworkId, stepId) => set((state) => ({
        homework: state.homework.map((h) =>
          h.id === homeworkId
            ? {
                ...h,
                steps: h.steps.map((s) =>
                  s.id === stepId ? { ...s, completed: !s.completed } : s
                ),
              }
            : h
        ),
      })),

      // ============ FLASHCARDS ============
      decks: [],

      addDeck: (deck) => {
        const id = generateId();
        set((state) => ({
          decks: [...state.decks, { ...deck, id, cards: [], createdAt: new Date().toISOString(), lastStudied: null }],
        }));
        return id;
      },

      updateDeck: (id, updates) => set((state) => ({
        decks: state.decks.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      })),

      deleteDeck: (id) => set((state) => ({
        decks: state.decks.filter((d) => d.id !== id),
      })),

      addCard: (deckId, front, back) => set((state) => ({
        decks: state.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: [...d.cards, {
                  id: generateId(),
                  front,
                  back,
                  easeFactor: 2.5,
                  interval: 0,
                  repetitions: 0,
                  nextReview: new Date().toISOString(),
                  lastReview: null,
                }],
              }
            : d
        ),
      })),

      addCards: (deckId, cards) => set((state) => ({
        decks: state.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: [...d.cards, ...cards.map((c) => ({
                  id: generateId(),
                  front: c.front,
                  back: c.back,
                  easeFactor: 2.5,
                  interval: 0,
                  repetitions: 0,
                  nextReview: new Date().toISOString(),
                  lastReview: null,
                }))],
              }
            : d
        ),
      })),

      updateCard: (deckId, cardId, updates) => set((state) => ({
        decks: state.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
              }
            : d
        ),
      })),

      deleteCard: (deckId, cardId) => set((state) => ({
        decks: state.decks.map((d) =>
          d.id === deckId
            ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
            : d
        ),
      })),

      // SM-2 Algorithm
      reviewCard: (deckId, cardId, quality) => set((state) => ({
        decks: state.decks.map((d) => {
          if (d.id !== deckId) return d;
          return {
            ...d,
            lastStudied: new Date().toISOString(),
            cards: d.cards.map((c) => {
              if (c.id !== cardId) return c;
              let { easeFactor, interval, repetitions } = c;

              if (quality >= 3) {
                if (repetitions === 0) interval = 1;
                else if (repetitions === 1) interval = 6;
                else interval = Math.round(interval * easeFactor);
                repetitions += 1;
              } else {
                repetitions = 0;
                interval = 1;
              }

              easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

              const nextReview = new Date();
              nextReview.setDate(nextReview.getDate() + interval);

              return {
                ...c,
                easeFactor,
                interval,
                repetitions,
                nextReview: nextReview.toISOString(),
                lastReview: new Date().toISOString(),
              };
            }),
          };
        }),
      })),

      // ============ QUIZZES ============
      quizzes: [],

      addQuiz: (quiz) => {
        const id = generateId();
        set((state) => ({
          quizzes: [...state.quizzes, { ...quiz, id, createdAt: new Date().toISOString(), completedAt: null, score: null }],
        }));
        return id;
      },

      updateQuiz: (id, updates) => set((state) => ({
        quizzes: state.quizzes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
      })),

      completeQuiz: (id, answers) => set((state) => ({
        quizzes: state.quizzes.map((q) => {
          if (q.id !== id) return q;
          const updatedQuestions = q.questions.map((question) => ({
            ...question,
            userAnswer: answers[question.id] || null,
            isCorrect: (answers[question.id] || '').toLowerCase().trim() === question.correctAnswer.toLowerCase().trim(),
          }));
          const correctCount = updatedQuestions.filter((qq) => qq.isCorrect).length;
          return {
            ...q,
            questions: updatedQuestions,
            score: Math.round((correctCount / q.totalQuestions) * 100),
            completedAt: new Date().toISOString(),
          };
        }),
      })),

      // ============ TIMER ============
      timerSessions: [],

      addTimerSession: (session) => {
        set((state) => ({
          timerSessions: [...state.timerSessions, { ...session, id: generateId() }],
        }));
        const state = get();
        state.addXP(XP_VALUES.finishPomodoro);
        state.updateStreak();
        state.updateDailyStats({ studyTime: Math.round(session.duration / 60) });
      },

      // ============ GRADES ============
      subjects: [],

      addSubject: (name, color) => set((state) => ({
        subjects: [...state.subjects, {
          id: generateId(),
          name,
          color,
          grades: [],
          goalGrade: null,
          weights: [{ id: generateId(), name: 'Default', weight: 1 }],
        }],
      })),

      updateSubject: (id, updates) => set((state) => ({
        subjects: state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),

      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter((s) => s.id !== id),
      })),

      addGrade: (subjectId, grade) => set((state) => ({
        subjects: state.subjects.map((s) =>
          s.id === subjectId
            ? { ...s, grades: [...s.grades, { ...grade, id: generateId() }] }
            : s
        ),
      })),

      deleteGrade: (subjectId, gradeId) => set((state) => ({
        subjects: state.subjects.map((s) =>
          s.id === subjectId
            ? { ...s, grades: s.grades.filter((g) => g.id !== gradeId) }
            : s
        ),
      })),

      // ============ NOTES ============
      notes: [],

      addNote: (note) => {
        const id = generateId();
        set((state) => ({
          notes: [...state.notes, {
            ...note,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
        }));
        return id;
      },

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),

      // ============ STATS ============
      dailyStats: [],

      updateDailyStats: (updates) => set((state) => {
        const today = getTodayString();
        const existing = state.dailyStats.find((s) => s.date === today);
        if (existing) {
          return {
            dailyStats: state.dailyStats.map((s) =>
              s.date === today
                ? {
                    ...s,
                    studyTime: s.studyTime + (updates.studyTime || 0),
                    cardsStudied: s.cardsStudied + (updates.cardsStudied || 0),
                    homeworkCompleted: s.homeworkCompleted + (updates.homeworkCompleted || 0),
                    quizzesTaken: s.quizzesTaken + (updates.quizzesTaken || 0),
                    xpEarned: s.xpEarned + (updates.xpEarned || 0),
                  }
                : s
            ),
          };
        }
        return {
          dailyStats: [...state.dailyStats, {
            date: today,
            studyTime: updates.studyTime || 0,
            cardsStudied: updates.cardsStudied || 0,
            homeworkCompleted: updates.homeworkCompleted || 0,
            quizzesTaken: updates.quizzesTaken || 0,
            xpEarned: updates.xpEarned || 0,
          }],
        };
      }),

      // ============ STUDY PLANS ============
      studyPlans: [],

      addStudyPlan: (plan) => set((state) => ({
        studyPlans: [...state.studyPlans, { ...plan, id: generateId(), createdAt: new Date().toISOString() }],
      })),

      updateStudyPlanDay: (planId, date, completed) => set((state) => ({
        studyPlans: state.studyPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                days: p.days.map((d) => (d.date === date ? { ...d, completed } : d)),
              }
            : p
        ),
      })),
    }),
    {
      name: 'studyhub-cloud-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        schedule: state.schedule,
        homework: state.homework,
        decks: state.decks,
        quizzes: state.quizzes,
        timerSessions: state.timerSessions,
        subjects: state.subjects,
        notes: state.notes,
        dailyStats: state.dailyStats,
        studyPlans: state.studyPlans,
      }),
    }
  )
);
