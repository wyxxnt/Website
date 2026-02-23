// ============ Core Types ============

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  school: string;
  country: Country;
  tier: 'free' | 'pro';
  aiRequestsToday: number;
  aiRequestsResetDate: string;
  goal: string;
  createdAt: string;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  points: number;
  unlockedRewards: string[];
  onboardingCompleted: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'uk' | 'de' | 'fr' | 'es';
  notifications: boolean;
  pomodoroWork: number;
  pomodoroBreak: number;
  pomodoreLongBreak: number;
  calendarIntegration: 'none' | 'google' | 'apple' | 'outlook';
}

export type Country = 'US' | 'UK' | 'DE' | 'UA' | 'FR' | 'ES' | 'PL' | 'CZ';

export interface GradingSystem {
  country: Country;
  name: string;
  scale: string;
  grades: GradeOption[];
  passingGrade: number;
  higherIsBetter: boolean;
}

export interface GradeOption {
  value: number;
  label: string;
  description: string;
}

// ============ Schedule Types ============

export interface ScheduleEntry {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  dayOfWeek: number; // 0=Monday, 6=Sunday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  weekType: 'all' | 'odd' | 'even';
}

// ============ Homework Types ============

export interface Homework {
  id: string;
  subject: string;
  task: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  steps: HomeworkStep[];
  createdAt: string;
}

export interface HomeworkStep {
  id: string;
  text: string;
  completed: boolean;
}

// ============ Flashcard Types ============

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  cards: Flashcard[];
  createdAt: string;
  lastStudied: string | null;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  // SM-2 Algorithm fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastReview: string | null;
}

// ============ Quiz Types ============

export interface Quiz {
  id: string;
  title: string;
  source: string;
  questions: QuizQuestion[];
  score: number | null;
  totalQuestions: number;
  completedAt: string | null;
  createdAt: string;
  timeLimit: number | null; // minutes
  examMode: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'open';
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string;
  isCorrect: boolean | null;
}

// ============ Timer Types ============

export interface TimerSession {
  id: string;
  subject: string;
  duration: number; // seconds
  type: 'pomodoro' | 'custom';
  completedAt: string;
  date: string;
}

// ============ Grade Types ============

export interface Subject {
  id: string;
  name: string;
  color: string;
  grades: Grade[];
  goalGrade: number | null;
  weights: GradeWeight[];
}

export interface Grade {
  id: string;
  value: number;
  label: string;
  weight: string;
  date: string;
  note: string;
}

export interface GradeWeight {
  id: string;
  name: string;
  weight: number;
}

// ============ Notes Types ============

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Gamification Types ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'cards' | 'homework' | 'timer' | 'quiz' | 'special';
  unlockedAt: string | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'theme' | 'avatar' | 'sound' | 'badge';
}

// ============ Study Plan Types ============

export interface StudyPlan {
  id: string;
  examDate: string;
  topics: string[];
  hoursPerDay: number;
  days: StudyPlanDay[];
  createdAt: string;
}

export interface StudyPlanDay {
  date: string;
  topics: string[];
  hours: number;
  completed: boolean;
}

// ============ Stats Types ============

export interface DailyStats {
  date: string;
  studyTime: number; // minutes
  cardsStudied: number;
  homeworkCompleted: number;
  quizzesTaken: number;
  xpEarned: number;
}
