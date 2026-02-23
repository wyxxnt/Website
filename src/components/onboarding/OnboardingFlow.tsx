'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { Country } from '@/lib/types';
import { countryNames } from '@/lib/grading-systems';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles,
  GraduationCap,
  CalendarCheck,
  Brain,
  Trophy,
  Target,
  PenLine,
  Check,
} from 'lucide-react';

const TOTAL_STEPS = 6;

const goalOptions = [
  { id: 'grades', label: 'Improve my grades', icon: GraduationCap },
  { id: 'organized', label: 'Stay organized', icon: CalendarCheck },
  { id: 'study', label: 'Study more effectively', icon: Brain },
  { id: 'exams', label: 'Prepare for exams', icon: Target },
];

const tutorialSlides = [
  {
    title: 'Track your schedule and homework',
    description:
      'Keep all your classes, assignments, and deadlines organized in one place. Never miss a due date again.',
    icon: CalendarCheck,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Study smarter with AI flashcards and quizzes',
    description:
      'Generate flashcards and quizzes from any topic. Our spaced-repetition system ensures you remember what you learn.',
    icon: Brain,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Earn XP and rewards as you learn',
    description:
      'Stay motivated with streaks, achievements, and unlockable rewards. Learning has never been this fun.',
    icon: Trophy,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
];

const countries = Object.keys(countryNames) as Country[];

// Confetti particle component
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    'bg-pink-400',
    'bg-purple-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-yellow-400',
    'bg-red-400',
    'bg-indigo-400',
    'bg-teal-400',
  ];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random() * 1.5;
  const size = 6 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className={`absolute rounded-sm ${color}`}
      style={{
        left: `${left}%`,
        top: -10,
        width: size,
        height: size,
        rotate: rotation,
      }}
      initial={{ y: -20, opacity: 1 }}
      animate={{
        y: [0, 400 + Math.random() * 200],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [rotation, rotation + 360 * (Math.random() > 0.5 ? 1 : -1)],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'easeOut',
      }}
    />
  );
}

export default function OnboardingFlow() {
  const { updateUser, completeOnboarding } = useStore();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form data
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [country, setCountry] = useState<Country | ''>('');
  const [goal, setGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [tutorialSlide, setTutorialSlide] = useState(0);

  const goNext = useCallback(() => {
    if (step === 4 && tutorialSlide < tutorialSlides.length - 1) {
      setTutorialSlide((prev) => prev + 1);
      return;
    }
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    if (step === 4) {
      setTutorialSlide(0);
    }
  }, [step, tutorialSlide]);

  const goBack = useCallback(() => {
    if (step === 4 && tutorialSlide > 0) {
      setTutorialSlide((prev) => prev - 1);
      return;
    }
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  }, [step, tutorialSlide]);

  const handleSkip = useCallback(() => {
    setDirection(1);
    setStep(TOTAL_STEPS - 1);
  }, []);

  const handleComplete = useCallback(() => {
    const finalGoal = isCustomGoal ? customGoal : goal;
    updateUser({
      name: name || undefined,
      school: school || undefined,
      country: (country as Country) || undefined,
      goal: finalGoal || undefined,
    });
    completeOnboarding();
  }, [name, school, country, goal, customGoal, isCustomGoal, updateUser, completeOnboarding]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return name.trim().length > 0;
      case 2:
        return country !== '';
      case 3:
        return goal !== '' || (isCustomGoal && customGoal.trim().length > 0);
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (step) {
      // Step 1: Welcome
      case 0:
        return (
          <motion.div
            key="welcome"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center px-2"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-200 dark:from-violet-800 dark:to-indigo-800 flex items-center justify-center mb-6 shadow-md">
              <BookOpen className="w-10 h-10 text-violet-600 dark:text-violet-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to StudyHub
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
              Let&apos;s set up your account
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
              We&apos;ll personalize your experience in just a few quick steps.
              It only takes a minute.
            </p>
          </motion.div>
        );

      // Step 2: Personal Info
      case 1:
        return (
          <motion.div
            key="personal"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center w-full px-2"
          >
            <div className="w-14 h-14 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-5">
              <PenLine className="w-7 h-7 text-pink-500 dark:text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Tell us about yourself
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              This helps us personalize your experience
            </p>
            <div className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  School / University
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. MIT, Oxford, Kyiv Polytechnic"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </motion.div>
        );

      // Step 3: Country Selection
      case 2:
        return (
          <motion.div
            key="country"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center w-full px-2"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
              <GraduationCap className="w-7 h-7 text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Where do you study?
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              Your grading system will adapt automatically
            </p>
            <div className="w-full max-w-sm">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select your country
                </option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {countryNames[c]}
                  </option>
                ))}
              </select>
              {country && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500"
                >
                  Grades, averages, and scales will match the{' '}
                  <span className="font-medium text-gray-600 dark:text-gray-300">
                    {countryNames[country].split(' ').slice(1).join(' ')}
                  </span>{' '}
                  system
                </motion.p>
              )}
            </div>
          </motion.div>
        );

      // Step 4: Goal Setting
      case 3:
        return (
          <motion.div
            key="goal"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center w-full px-2"
          >
            <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
              <Target className="w-7 h-7 text-green-500 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              What&apos;s your main goal?
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              We&apos;ll tailor features to help you achieve it
            </p>
            <div className="w-full max-w-sm space-y-2.5">
              {goalOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = !isCustomGoal && goal === opt.label;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setGoal(opt.label);
                      setIsCustomGoal(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-500 shadow-sm'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isSelected
                          ? 'text-violet-500 dark:text-violet-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-violet-700 dark:text-violet-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 ml-auto text-violet-500 dark:text-violet-400" />
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsCustomGoal(true);
                  setGoal('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  isCustomGoal
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-500 shadow-sm'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <PenLine
                  className={`w-5 h-5 flex-shrink-0 ${
                    isCustomGoal
                      ? 'text-violet-500 dark:text-violet-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isCustomGoal
                      ? 'text-violet-700 dark:text-violet-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Something else...
                </span>
              </button>
              {isCustomGoal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Type your goal here..."
                    autoFocus
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 focus:border-transparent transition-all text-sm"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      // Step 5: Tutorial Slides
      case 4:
        return (
          <motion.div
            key="tutorial"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center w-full px-2"
          >
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={`slide-${tutorialSlide}`}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex flex-col items-center text-center"
              >
                {(() => {
                  const slide = tutorialSlides[tutorialSlide];
                  const Icon = slide.icon;
                  return (
                    <>
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${slide.color}`}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {slide.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                        {slide.description}
                      </p>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
            {/* Slide indicator dots */}
            <div className="flex gap-2 mt-8">
              {tutorialSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTutorialSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === tutorialSlide
                      ? 'bg-violet-500 w-6'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        );

      // Step 6: Complete
      case 5:
        return (
          <motion.div
            key="complete"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center px-2 relative overflow-hidden"
          >
            {/* Confetti animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <ConfettiParticle key={i} index={i} />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 flex items-center justify-center mb-6 shadow-md"
            >
              <Sparkles className="w-10 h-10 text-green-600 dark:text-green-300" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              You&apos;re all set!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-gray-400 dark:text-gray-500 mb-8"
            >
              Here&apos;s a quick summary of your profile
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full max-w-xs space-y-3"
            >
              {name && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {name}
                  </span>
                </div>
              )}
              {school && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs text-gray-400 dark:text-gray-500">School</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {school}
                  </span>
                </div>
              )}
              {country && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Country</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {countryNames[country]}
                  </span>
                </div>
              )}
              {(goal || customGoal) && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Goal</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {isCustomGoal ? customGoal : goal}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 relative overflow-hidden">
        {/* Skip button */}
        {step < TOTAL_STEPS - 1 && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Skip
          </button>
        )}

        {/* Step content */}
        <div className="min-h-[340px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goBack}
            disabled={step === 0 && tutorialSlide === 0}
            className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-xl transition-all ${
              step === 0 && tutorialSlide === 0
                ? 'text-transparent cursor-default'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-6 bg-violet-500'
                    : i < step
                    ? 'w-1.5 bg-violet-300 dark:bg-violet-700'
                    : 'w-1.5 bg-gray-200 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {step === TOTAL_STEPS - 1 ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1 text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all"
            >
              Get Started
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={`flex items-center gap-1 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-md hover:shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
