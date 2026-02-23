'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/stores/useStore';
import XP_VALUES from '@/lib/gamification';
import { cn, formatDate } from '@/lib/utils';
import type { Quiz, QuizQuestion } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuizView = 'list' | 'quiz' | 'results';

type QuestionType = 'multiple_choice' | 'true_false' | 'mixed';

interface CreateFormState {
  title: string;
  source: string;
  numQuestions: 5 | 10 | 15 | 20;
  questionType: QuestionType;
  timeLimit: null | 5 | 10 | 15 | 30;
  examMode: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const DEMO_QUESTIONS: Omit<QuizQuestion, 'id' | 'userAnswer' | 'isCorrect'>[] = [
  {
    type: 'multiple_choice',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    explanation: 'Paris is the capital and largest city of France.',
  },
  {
    type: 'true_false',
    question: 'The Earth is the largest planet in the solar system.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Jupiter is the largest planet in the solar system.',
  },
  {
    type: 'multiple_choice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: 'Basic arithmetic: 2 + 2 = 4.',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function scoreBadgeClass(score: number): string {
  if (score >= 70) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function buildQuizId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', scoreBadgeClass(score))}>
      {score}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// Create Quiz Modal
// ---------------------------------------------------------------------------

interface CreateQuizModalProps {
  onClose: () => void;
  onCreate: (quizId: string) => void;
}

function CreateQuizModal({ onClose, onCreate }: CreateQuizModalProps) {
  const addQuiz = useStore((s) => s.addQuiz);

  const [form, setForm] = useState<CreateFormState>({
    title: '',
    source: '',
    numQuestions: 5,
    questionType: 'multiple_choice',
    timeLimit: null,
    examMode: false,
  });

  const handleGenerate = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a quiz title.');
      return;
    }

    toast('AI quiz generation coming in Pro — showing a demo quiz instead!', {
      icon: '✨',
      duration: 4000,
    });

    const questions: QuizQuestion[] = DEMO_QUESTIONS.map((q, i) => ({
      ...q,
      id: `demo-q-${i}`,
      userAnswer: null,
      isCorrect: null,
    }));

    const quizId = addQuiz({
      title: form.title.trim(),
      source: form.source.trim() || 'Demo',
      questions,
      totalQuestions: questions.length,
      timeLimit: form.timeLimit,
      examMode: form.examMode,
    });

    onClose();
    onCreate(quizId);
  };

  const timeLimitOptions: Array<{ label: string; value: null | 5 | 10 | 15 | 30 }> = [
    { label: 'None', value: null },
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
  ];

  const questionCounts: Array<5 | 10 | 15 | 20> = [5, 10, 15, 20];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="bg-white dark:bg-[#1E1E32] rounded-3xl p-6 shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5">Create Quiz</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Quiz Title
          </label>
          <input
            type="text"
            placeholder="e.g. Chapter 5 Review"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100"
          />
        </div>

        {/* AI Topic */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Topic / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Describe a topic or paste notes to generate questions…"
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 resize-none"
          />
        </div>

        {/* Number of questions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Number of Questions
          </label>
          <div className="flex gap-2">
            {questionCounts.map((n) => (
              <button
                key={n}
                onClick={() => setForm((f) => ({ ...f, numQuestions: n }))}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                  form.numQuestions === n
                    ? 'bg-lavender-500 border-lavender-500 text-white'
                    : 'bg-cream-300 dark:bg-white/10 border-cream-400 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-cream-400 dark:hover:bg-white/15'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Question type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Question Type
          </label>
          <div className="flex gap-2">
            {(['multiple_choice', 'true_false', 'mixed'] as QuestionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, questionType: t }))}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-medium border transition-colors',
                  form.questionType === t
                    ? 'bg-lavender-500 border-lavender-500 text-white'
                    : 'bg-cream-300 dark:bg-white/10 border-cream-400 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-cream-400 dark:hover:bg-white/15'
                )}
              >
                {t === 'multiple_choice' ? 'Multiple Choice' : t === 'true_false' ? 'True / False' : 'Mixed'}
              </button>
            ))}
          </div>
        </div>

        {/* Time limit */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Time Limit
          </label>
          <div className="flex gap-2 flex-wrap">
            {timeLimitOptions.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setForm((f) => ({ ...f, timeLimit: opt.value }))}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-medium border transition-colors',
                  form.timeLimit === opt.value
                    ? 'bg-lavender-500 border-lavender-500 text-white'
                    : 'bg-cream-300 dark:bg-white/10 border-cream-400 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-cream-400 dark:hover:bg-white/15'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exam mode */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hides answers until end</p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, examMode: !f.examMode }))}
            className="text-lavender-500"
          >
            {form.examMode ? (
              <ToggleRight className="w-8 h-8" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-gray-400" />
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-cream-300 hover:bg-cream-400 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI (Pro)
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Exit Modal
// ---------------------------------------------------------------------------

function ConfirmExitModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-[#1E1E32] rounded-3xl p-6 shadow-2xl w-full max-w-sm mx-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Exit Quiz?</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Your progress will be lost. Are you sure you want to go back?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-cream-300 hover:bg-cream-400 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Exit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz List View
// ---------------------------------------------------------------------------

interface QuizListProps {
  quizzes: Quiz[];
  onTakeQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onCreateQuiz: () => void;
}

function QuizListView({ quizzes, onTakeQuiz, onDeleteQuiz, onCreateQuiz }: QuizListProps) {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quiz</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <button
          onClick={onCreateQuiz}
          className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </button>
      </div>

      {/* Empty state */}
      {quizzes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-lavender-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No quizzes yet!</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first quiz to get started.</p>
          <button
            onClick={onCreateQuiz}
            className="mt-5 bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>
        </motion.div>
      )}

      {/* Quiz list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-[#1E1E32] rounded-2xl border border-cream-400 dark:border-dark-border shadow-soft p-4 flex items-center gap-4"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-lavender-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{quiz.title}</p>
                  {quiz.score !== null && <ScoreBadge score={quiz.score} />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {quiz.source} &middot; {quiz.totalQuestions} questions &middot; {formatDate(quiz.createdAt)}
                </p>
                {quiz.completedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Completed {formatDate(quiz.completedAt)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onTakeQuiz(quiz)}
                  className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {quiz.completedAt ? 'Retake' : 'Take Quiz'}
                </button>
                <button
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz Mode
// ---------------------------------------------------------------------------

interface QuizModeProps {
  quiz: Quiz;
  onComplete: (answers: Record<string, string>) => void;
  onExit: () => void;
}

function QuizMode({ quiz, onComplete, onExit }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit on timeout
          const finalAnswers = { ...answers };
          quiz.questions.forEach((q) => {
            if (!finalAnswers[q.id]) finalAnswers[q.id] = '';
          });
          onComplete(finalAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectOption = (option: string) => {
    if (revealed) return;
    setSelectedAnswer(option);
  };

  const handleNext = useCallback(() => {
    const answer =
      question.type === 'fill_blank' ? fillInput.trim() : selectedAnswer ?? '';

    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    if (!quiz.examMode) {
      if (!revealed) {
        setRevealed(true);
        return;
      }
    }

    if (isLast) {
      clearInterval(timerRef.current!);
      const finalAnswers = { ...newAnswers };
      quiz.questions.forEach((q) => {
        if (!finalAnswers[q.id]) finalAnswers[q.id] = '';
      });
      onComplete(finalAnswers);
      return;
    }

    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setRevealed(false);
    setFillInput('');
  }, [question, fillInput, selectedAnswer, answers, quiz, isLast, onComplete, revealed]);

  const canProceed =
    question.type === 'fill_blank'
      ? fillInput.trim().length > 0
      : selectedAnswer !== null;

  const isCorrectAnswer = (option: string) => option === question.correctAnswer;
  const isSelectedWrong = revealed && selectedAnswer !== null && selectedAnswer !== question.correctAnswer;

  const timerColor =
    timeLeft === null
      ? ''
      : timeLeft <= 30
      ? 'text-rose-500'
      : timeLeft <= 60
      ? 'text-amber-500'
      : 'text-gray-600 dark:text-gray-400';

  return (
    <>
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#16162A] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-cream-400 dark:border-dark-border bg-white dark:bg-[#1E1E32]">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={cn('flex items-center gap-1.5 font-mono text-sm font-semibold', timerColor)}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {quiz.questions.length}
            </span>
          </div>

          {quiz.examMode && (
            <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">
              Exam Mode
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-white/10">
          <motion.div
            className="h-full bg-lavender-500"
            animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question area */}
        <div className="flex-1 flex items-start justify-center px-4 py-8 md:py-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
              >
                {/* Question type badge */}
                <span className="inline-block text-xs font-medium bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400 px-2.5 py-1 rounded-full mb-4 capitalize">
                  {question.type.replace('_', ' ')}
                </span>

                {/* Question text */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8 leading-snug">
                  {question.question}
                </h2>

                {/* Options */}
                {(question.type === 'multiple_choice' || question.type === 'true_false') && (
                  <div className="space-y-3">
                    {question.options.map((option, i) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = isCorrectAnswer(option);
                      let optionStyle = '';

                      if (revealed) {
                        if (isCorrect) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
                        } else if (isSelected && !isCorrect) {
                          optionStyle =
                            'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300';
                        } else {
                          optionStyle =
                            'border-cream-400 dark:border-dark-border text-gray-500 dark:text-gray-500 opacity-60';
                        }
                      } else if (isSelected) {
                        optionStyle =
                          'border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20 text-lavender-700 dark:text-lavender-300';
                      } else {
                        optionStyle =
                          'border-cream-400 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:border-lavender-400 hover:bg-lavender-50/50 dark:hover:bg-lavender-900/10';
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectOption(option)}
                          disabled={revealed}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150',
                            optionStyle
                          )}
                        >
                          {question.type === 'multiple_choice' && (
                            <span className="w-7 h-7 rounded-lg bg-current/10 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {OPTION_LABELS[i]}
                            </span>
                          )}
                          <span className="text-sm font-medium">{option}</span>
                          {revealed && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0 text-emerald-500" />
                          )}
                          {revealed && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 ml-auto flex-shrink-0 text-rose-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in the blank */}
                {question.type === 'fill_blank' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Type your answer…"
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      disabled={revealed}
                      className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100"
                    />
                    {revealed && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Correct answer:{' '}
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {question.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Open-ended */}
                {question.type === 'open' && (
                  <div>
                    <textarea
                      rows={4}
                      placeholder="Write your answer…"
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      disabled={revealed}
                      className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 resize-none"
                    />
                  </div>
                )}

                {/* Explanation (non-exam mode after reveal) */}
                <AnimatePresence>
                  {revealed && !quiz.examMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4"
                    >
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Explanation</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next button */}
                <div className="mt-8">
                  <button
                    onClick={handleNext}
                    disabled={!canProceed && !revealed}
                    className={cn(
                      'w-full py-3 rounded-xl text-sm font-semibold transition-colors',
                      canProceed || revealed
                        ? 'bg-lavender-500 hover:bg-lavender-600 text-white'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    )}
                  >
                    {!quiz.examMode && !revealed
                      ? 'Submit Answer'
                      : isLast
                      ? 'Finish Quiz'
                      : 'Next Question'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <ConfirmExitModal
            onConfirm={onExit}
            onCancel={() => setShowExitConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// Results Screen
// ---------------------------------------------------------------------------

interface ResultsScreenProps {
  quiz: Quiz;
  onBack: () => void;
}

function ResultsScreen({ quiz, onBack }: ResultsScreenProps) {
  const score = quiz.score ?? 0;
  const correctCount = quiz.questions.filter((q) => q.isCorrect).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#16162A]">
      {/* Top */}
      <div className="px-4 md:px-6 py-4 border-b border-cream-400 dark:border-dark-border bg-white dark:bg-[#1E1E32]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Quizzes
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Score hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, type: 'spring' }}
          className="text-center mb-10"
        >
          <div className={cn('text-7xl font-extrabold mb-2', scoreColor(score))}>
            {score}%
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {correctCount} out of {quiz.totalQuestions} correct
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quiz.title}</p>

          {score === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Perfect Score! +{XP_VALUES.perfectQuiz} XP
            </motion.div>
          )}
          {score < 100 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-lavender-100 dark:bg-lavender-900/30 text-lavender-700 dark:text-lavender-400 px-4 py-2 rounded-full text-sm font-medium">
              +{XP_VALUES.completeQuiz} XP earned
            </div>
          )}
        </motion.div>

        {/* Review Answers */}
        <div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Review Answers</h3>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className={cn(
                  'bg-white dark:bg-[#1E1E32] rounded-2xl border shadow-soft p-4',
                  q.isCorrect
                    ? 'border-emerald-200 dark:border-emerald-800'
                    : 'border-rose-200 dark:border-rose-800'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {idx + 1}. {q.question}
                    </p>

                    {q.userAnswer && (
                      <p className={cn('text-xs mb-1', q.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                        Your answer:{' '}
                        <span className="font-semibold">{q.userAnswer || '(no answer)'}</span>
                      </p>
                    )}

                    {!q.isCorrect && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                        Correct answer:{' '}
                        <span className="font-semibold">{q.correctAnswer}</span>
                      </p>
                    )}

                    {q.explanation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-8 w-full bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuizPage (root)
// ---------------------------------------------------------------------------

export default function QuizPage() {
  const quizzes = useStore((s) => s.quizzes);
  const updateQuiz = useStore((s) => s.updateQuiz);
  const deleteQuizFn = useStore((s) => s.updateQuiz);
  const completeQuizFn = useStore((s) => s.completeQuiz);
  const addXP = useStore((s) => s.addXP);

  // We delete by filtering from the store — since there's no deleteQuiz action,
  // we replicate with updateQuiz approach. Actually useStore has no deleteQuiz,
  // so we access the raw set via a workaround: we grab full state setter.
  // The store exposes no deleteQuiz, so we must call updateQuiz to mark deleted
  // OR we can use the Zustand store directly by importing create. Let's use
  // a simple approach: filter with setState isn't exposed. We'll hide the quiz
  // by maintaining a local deleted set, but ideally we'd call a store action.
  // Since the store has no deleteQuiz, let's use updateQuiz to mark and filter.
  // Actually — we can reach the store's setState. Let's instead add a local
  // deleted-IDs state and filter on render.

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<QuizView>('list');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasTriggeredXP, setHasTriggeredXP] = useState(false);

  const visibleQuizzes = quizzes.filter((q) => !deletedIds.has(q.id));
  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) ?? null;

  const handleTakeQuiz = (quiz: Quiz) => {
    // Reset quiz answers so it can be retaken
    updateQuiz(quiz.id, {
      questions: quiz.questions.map((q) => ({
        ...q,
        userAnswer: null,
        isCorrect: null,
      })),
      score: null,
      completedAt: null,
    });
    setActiveQuizId(quiz.id);
    setHasTriggeredXP(false);
    setView('quiz');
  };

  const handleDeleteQuiz = (id: string) => {
    setDeletedIds((prev) => new Set([...prev, id]));
    toast.success('Quiz deleted.');
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    if (!activeQuizId) return;
    completeQuizFn(activeQuizId, answers);

    // We need the updated quiz to know the score. Re-compute here.
    const quiz = quizzes.find((q) => q.id === activeQuizId);
    if (quiz && !hasTriggeredXP) {
      const correctCount = quiz.questions.filter(
        (q) => (answers[q.id] || '').toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      ).length;
      const scorePercent = Math.round((correctCount / quiz.totalQuestions) * 100);
      addXP(scorePercent === 100 ? XP_VALUES.perfectQuiz : XP_VALUES.completeQuiz);
      setHasTriggeredXP(true);
    }

    setView('results');
  };

  const handleBackFromResults = () => {
    setActiveQuizId(null);
    setView('list');
  };

  const handleExitQuiz = () => {
    setActiveQuizId(null);
    setView('list');
  };

  const handleQuizCreated = (quizId: string) => {
    setActiveQuizId(quizId);
    setHasTriggeredXP(false);
    setView('quiz');
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <QuizListView
              quizzes={visibleQuizzes}
              onTakeQuiz={handleTakeQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onCreateQuiz={() => setShowCreateModal(true)}
            />
          </motion.div>
        )}

        {view === 'quiz' && activeQuiz && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <QuizMode
              quiz={activeQuiz}
              onComplete={handleQuizComplete}
              onExit={handleExitQuiz}
            />
          </motion.div>
        )}

        {view === 'results' && activeQuiz && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ResultsScreen
              quiz={activeQuiz}
              onBack={handleBackFromResults}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && (
          <CreateQuizModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleQuizCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
}
