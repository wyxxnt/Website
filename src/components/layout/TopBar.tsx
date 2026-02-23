'use client';

import { usePathname } from 'next/navigation';
import { Menu, Flame, Coins } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/schedule': 'Schedule',
  '/homework': 'Homework',
  '/flashcards': 'Flashcards',
  '/quiz': 'Quiz',
  '/timer': 'Timer',
  '/grades': 'Grades',
  '/notes': 'Notes',
  '/stats': 'Stats',
  '/settings': 'Settings',
};

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const user = useStore((state) => state.user);

  const currentTitle =
    Object.entries(pageTitles).find(
      ([path]) => pathname === path || pathname?.startsWith(path + '/')
    )?.[1] || 'StudyHub';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden',
        'bg-white/80 dark:bg-[#1E1E32]/80 backdrop-blur-md',
        'border-b border-gray-100 dark:border-gray-800'
      )}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {currentTitle}
        </h1>
      </div>

      {/* Right: streak + points */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <Flame size={16} className="text-orange-400" />
            <span className="font-semibold">{user.streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <Coins size={16} className="text-amber-400" />
            <span className="font-semibold">{user.points}</span>
          </div>
        </div>
      )}
    </header>
  );
}
