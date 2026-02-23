'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Brain,
  HelpCircle,
  Timer,
  Award,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  Menu,
  X,
  Flame,
  Coins,
} from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';
import { getLevelTitle, getXPProgress, getLevelFromXP } from '@/lib/gamification';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/homework', label: 'Homework', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Brain },
  { href: '/quiz', label: 'Quiz', icon: HelpCircle },
  { href: '/timer', label: 'Timer', icon: Timer },
  { href: '/grades', label: 'Grades', icon: Award },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const user = useStore((state) => state.user);

  const level = user ? getLevelFromXP(user.xp) : 1;
  const levelTitle = getLevelTitle(level);
  const xpProgress = user ? getXPProgress(user.xp) : { current: 0, needed: 200, percentage: 0 };

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden animate-backdrop-enter"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 flex flex-col',
          'bg-cream-200 dark:bg-[#1E1E32] border-r border-cream-400 dark:border-dark-border',
          'transition-transform duration-300 ease-smooth',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-400 to-lavender-600 text-white shadow-soft">
              <GraduationCap size={20} />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              StudyHub
            </span>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-cream-700 hover:text-gray-600 hover:bg-cream-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-dark-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname?.startsWith(link.href + '/');
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-lavender-50 text-lavender-700 dark:bg-lavender-500/15 dark:text-lavender-300 shadow-soft'
                    : 'text-cream-800 hover:text-gray-700 hover:bg-cream-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5'
                )}
              >
                <Icon
                  size={19}
                  className={cn(
                    isActive
                      ? 'text-lavender-500 dark:text-lavender-400'
                      : 'text-cream-600 dark:text-dark-muted'
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="mx-3 mb-4 p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-cream-400 dark:border-dark-border shadow-soft">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-lavender-300 to-lavender-500 text-white text-sm font-bold shadow-soft">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-cream-700 dark:text-dark-muted">
                  Lvl {level} &middot; {levelTitle}
                </p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs font-medium text-cream-700 dark:text-dark-muted uppercase tracking-wider">
                  XP
                </span>
                <span className="text-2xs font-medium text-cream-700 dark:text-dark-muted">
                  {xpProgress.current}/{xpProgress.needed}
                </span>
              </div>
              <div className="w-full h-1.5 bg-cream-400 dark:bg-dark-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lavender-400 to-lavender-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(xpProgress.percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Points + Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-cream-800 dark:text-gray-400">
                <Coins size={14} className="text-peach-500" />
                <span className="font-semibold">{user.points}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-cream-800 dark:text-gray-400">
                <Flame size={14} className="text-orange-400" />
                <span className="font-semibold">{user.streak}</span>
                <span className="text-cream-700 dark:text-dark-muted">day{user.streak !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
