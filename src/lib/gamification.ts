import { Achievement, Reward } from './types';

export const XP_VALUES = {
  completeHomework: 25,
  studyFlashcards: 10,
  finishPomodoro: 15,
  completeQuiz: 30,
  perfectQuiz: 50,
  createNote: 5,
  dailyLogin: 10,
  streak7: 100,
  streak30: 500,
};

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 200) + 1;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * 200;
}

export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percentage: (current / needed) * 100 };
}

export function getLevelTitle(level: number): string {
  if (level <= 2) return 'Beginner';
  if (level <= 5) return 'Student';
  if (level <= 10) return 'Learner';
  if (level <= 15) return 'Scholar';
  if (level <= 20) return 'Academic';
  if (level <= 30) return 'Expert';
  if (level <= 40) return 'Master';
  if (level <= 50) return 'Professor';
  return 'Grand Master';
}

export const achievements: Achievement[] = [
  { id: 'streak_3', name: 'Getting Started', description: '3-day study streak', icon: '🔥', requirement: 3, type: 'streak', unlockedAt: null },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day study streak', icon: '⚡', requirement: 7, type: 'streak', unlockedAt: null },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day study streak', icon: '🏆', requirement: 30, type: 'streak', unlockedAt: null },
  { id: 'streak_100', name: 'Century Scholar', description: '100-day study streak', icon: '💎', requirement: 100, type: 'streak', unlockedAt: null },
  { id: 'cards_50', name: 'Card Collector', description: 'Study 50 flashcards', icon: '🃏', requirement: 50, type: 'cards', unlockedAt: null },
  { id: 'cards_100', name: 'Card Master', description: 'Study 100 flashcards', icon: '📚', requirement: 100, type: 'cards', unlockedAt: null },
  { id: 'cards_500', name: 'Memory Palace', description: 'Study 500 flashcards', icon: '🏰', requirement: 500, type: 'cards', unlockedAt: null },
  { id: 'hw_10', name: 'Task Starter', description: 'Complete 10 homework tasks', icon: '📝', requirement: 10, type: 'homework', unlockedAt: null },
  { id: 'hw_50', name: 'Homework Hero', description: 'Complete 50 homework tasks', icon: '🦸', requirement: 50, type: 'homework', unlockedAt: null },
  { id: 'timer_10', name: 'Focus Finder', description: 'Complete 10 pomodoro sessions', icon: '🍅', requirement: 10, type: 'timer', unlockedAt: null },
  { id: 'timer_50', name: 'Deep Focus', description: 'Complete 50 pomodoro sessions', icon: '🧘', requirement: 50, type: 'timer', unlockedAt: null },
  { id: 'timer_100', name: 'Zen Master', description: 'Complete 100 pomodoro sessions', icon: '🧠', requirement: 100, type: 'timer', unlockedAt: null },
  { id: 'quiz_perfect', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', requirement: 1, type: 'quiz', unlockedAt: null },
  { id: 'quiz_10', name: 'Quiz Whiz', description: 'Complete 10 quizzes', icon: '❓', requirement: 10, type: 'quiz', unlockedAt: null },
  { id: 'night_owl', name: 'Night Owl', description: 'Study after 11 PM', icon: '🦉', requirement: 1, type: 'special', unlockedAt: null },
  { id: 'early_bird', name: 'Early Bird', description: 'Study before 7 AM', icon: '🐦', requirement: 1, type: 'special', unlockedAt: null },
];

export const rewards: Reward[] = [
  { id: 'theme_ocean', name: 'Ocean Theme', description: 'Unlock the ocean blue color theme', icon: '🌊', cost: 200, type: 'theme' },
  { id: 'theme_forest', name: 'Forest Theme', description: 'Unlock the forest green color theme', icon: '🌲', cost: 200, type: 'theme' },
  { id: 'theme_sunset', name: 'Sunset Theme', description: 'Unlock the sunset orange color theme', icon: '🌅', cost: 200, type: 'theme' },
  { id: 'theme_galaxy', name: 'Galaxy Theme', description: 'Unlock the galaxy purple color theme', icon: '🌌', cost: 500, type: 'theme' },
  { id: 'avatar_crown', name: 'Crown Avatar', description: 'Unlock the crown avatar frame', icon: '👑', cost: 300, type: 'avatar' },
  { id: 'avatar_star', name: 'Star Avatar', description: 'Unlock the star avatar frame', icon: '⭐', cost: 150, type: 'avatar' },
  { id: 'sound_ocean', name: 'Ocean Waves', description: 'Unlock ocean waves ambient sound', icon: '🐚', cost: 100, type: 'sound' },
  { id: 'sound_forest', name: 'Forest Rain', description: 'Unlock forest rain ambient sound', icon: '🌧️', cost: 100, type: 'sound' },
  { id: 'sound_fireplace', name: 'Fireplace', description: 'Unlock cozy fireplace sound', icon: '🔥', cost: 100, type: 'sound' },
  { id: 'badge_vip', name: 'VIP Badge', description: 'Display VIP badge on your profile', icon: '💎', cost: 1000, type: 'badge' },
  { id: 'badge_scholar', name: 'Scholar Badge', description: 'Display scholar badge on your profile', icon: '🎓', cost: 500, type: 'badge' },
];
