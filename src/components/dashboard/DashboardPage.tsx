'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/stores/useStore';
import {
  Timer,
  Plus,
  Brain,
  HelpCircle,
  BookOpen,
  Clock,
  Flame,
  Trophy,
  Target,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getLevelTitle, getXPProgress } from '@/lib/gamification';
import {
  formatDate,
  getDayName,
  isOverdue,
  getDaysUntil,
  isOddWeek,
} from '@/lib/utils';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentDayOfWeek(): number {
  const jsDay = new Date().getDay(); // 0 = Sunday
  return jsDay === 0 ? 6 : jsDay - 1; // convert to 0 = Monday
}

function getDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

function getShortDayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ---------------------------------------------------------------------------
// Priority badge
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const styles: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: 'pending' | 'in_progress' | 'completed' }) {
  const labels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Done',
  };
  const styles: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`rounded-2xl bg-white shadow-sm p-6 dark:bg-gray-800 ${className}`}
  >
    {children}
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const schedule = useStore((s) => s.schedule);
  const homework = useStore((s) => s.homework);
  const dailyStats = useStore((s) => s.dailyStats);
  const timerSessions = useStore((s) => s.timerSessions);

  // ---- Greeting ----------------------------------------------------------

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] ?? 'Student';

  // ---- Streak calendar (last 30 days) ------------------------------------

  const streakCalendar = useMemo(() => {
    const studiedDates = new Set<string>();

    // Dates from dailyStats where studyTime > 0
    dailyStats.forEach((s) => {
      if (s.studyTime > 0) studiedDates.add(s.date);
    });

    // Also mark lastStudyDate if present
    if (user?.lastStudyDate) studiedDates.add(user.lastStudyDate);

    const days: { date: string; studied: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dateStr = getDateString(-i);
      days.push({ date: dateStr, studied: studiedDates.has(dateStr) });
    }
    return days;
  }, [dailyStats, user?.lastStudyDate]);

  // ---- XP progress -------------------------------------------------------

  const xpProgress = useMemo(
    () => (user ? getXPProgress(user.xp) : { current: 0, needed: 200, percentage: 0 }),
    [user],
  );
  const levelTitle = useMemo(() => getLevelTitle(user?.level ?? 1), [user?.level]);

  // ---- Today's schedule ---------------------------------------------------

  const todayClasses = useMemo(() => {
    const currentDay = getCurrentDayOfWeek();
    const oddWeek = isOddWeek();
    return schedule
      .filter((entry) => {
        if (entry.dayOfWeek !== currentDay) return false;
        if (entry.weekType === 'all') return true;
        if (entry.weekType === 'odd' && oddWeek) return true;
        if (entry.weekType === 'even' && !oddWeek) return true;
        return false;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedule]);

  // ---- Upcoming homework (next 7 days) -----------------------------------

  const upcomingHomework = useMemo(() => {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return homework
      .filter((hw) => {
        const due = new Date(hw.dueDate);
        return hw.status !== 'completed' && due >= now && due <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [homework]);

  // ---- Weekly study time (last 7 days) -----------------------------------

  const weeklyChartData = useMemo(() => {
    const statsMap = new Map<string, number>();
    dailyStats.forEach((s) => statsMap.set(s.date, s.studyTime));

    return Array.from({ length: 7 }, (_, i) => {
      const dateStr = getDateString(-(6 - i));
      return {
        day: getShortDayLabel(-(6 - i)),
        minutes: statsMap.get(dateStr) ?? 0,
      };
    });
  }, [dailyStats]);

  // ---- Recent activity (last 5) ------------------------------------------

  const recentActivity = useMemo(() => {
    type Activity = { id: string; icon: string; label: string; time: string };
    const activities: Activity[] = [];

    // Timer sessions
    timerSessions.forEach((s) => {
      activities.push({
        id: `timer-${s.id}`,
        icon: 'timer',
        label: `Completed ${Math.round(s.duration / 60)}min ${s.type} session${s.subject ? ` – ${s.subject}` : ''}`,
        time: s.completedAt,
      });
    });

    // Completed homework
    homework
      .filter((hw) => hw.status === 'completed')
      .forEach((hw) => {
        activities.push({
          id: `hw-${hw.id}`,
          icon: 'homework',
          label: `Completed homework: ${hw.task}`,
          time: hw.createdAt, // best available timestamp
        });
      });

    // Sort newest first and take 5
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return activities.slice(0, 5);
  }, [timerSessions, homework]);

  // ---- Quick actions ------------------------------------------------------

  const quickActions = [
    { label: 'Start Timer', href: '/timer', icon: Timer, color: 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-300' },
    { label: 'Add Homework', href: '/homework', icon: Plus, color: 'bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Create Flashcard', href: '/flashcards', icon: Brain, color: 'bg-violet-50 text-violet-500 dark:bg-violet-900/30 dark:text-violet-300' },
    { label: 'Take Quiz', href: '/quiz', icon: HelpCircle, color: 'bg-sky-50 text-sky-500 dark:bg-sky-900/30 dark:text-sky-300' },
  ];

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Greeting ----------------------------------------------------- */}
      <motion.h1
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
      >
        {greeting}, {firstName}!
      </motion.h1>

      {/* ---- Top row: Streak + XP ---------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Streak */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Study Streak
              </h2>
            </div>
            <span className="text-2xl font-bold text-orange-500">
              {user?.streak ?? 0}{' '}
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                day streak
              </span>
            </span>
          </div>

          {/* Streak calendar dots */}
          <div className="flex flex-wrap gap-1.5">
            {streakCalendar.map((day) => (
              <div
                key={day.date}
                title={day.date}
                className={`h-3 w-3 rounded-full transition-colors ${
                  day.studied
                    ? 'bg-orange-400 dark:bg-orange-500'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Last 30 days</p>
        </Card>

        {/* XP / Level */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Level {user?.level ?? 1}{' '}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {levelTitle}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <Target className="h-4 w-4" />
              {user?.points ?? 0} pts
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {xpProgress.current} / {xpProgress.needed} XP
            </span>
            <span>{Math.round(xpProgress.percentage)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {xpProgress.needed - xpProgress.current} XP until Level{' '}
            {(user?.level ?? 1) + 1}
          </p>
        </Card>
      </div>

      {/* ---- Second row: Schedule + Homework ------------------------------ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Today&apos;s Schedule
              </h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {getDayName(getCurrentDayOfWeek())}
            </span>
          </div>

          {todayClasses.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              No classes today!
            </p>
          ) : (
            <ul className="space-y-3">
              {todayClasses.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50"
                >
                  <div
                    className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color || '#a5b4fc' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.startTime} – {entry.endTime} &middot; {entry.room}
                      {entry.teacher ? ` &middot; ${entry.teacher}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Upcoming Homework */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upcoming Homework
              </h2>
            </div>
            <Link
              href="/homework"
              className="flex items-center gap-0.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingHomework.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
              No upcoming homework. Enjoy!
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingHomework.map((hw) => {
                const daysLeft = getDaysUntil(hw.dueDate);
                const overdue = isOverdue(hw.dueDate);
                return (
                  <li
                    key={hw.id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {hw.task}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {hw.subject} &middot;{' '}
                        <span className={overdue ? 'text-rose-500' : ''}>
                          {overdue
                            ? 'Overdue'
                            : daysLeft === 0
                              ? 'Due today'
                              : daysLeft === 1
                                ? 'Due tomorrow'
                                : `Due in ${daysLeft} days`}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <PriorityBadge priority={hw.priority} />
                      <StatusBadge status={hw.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ---- Quick Actions ------------------------------------------------ */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-700/40 dark:hover:bg-gray-700"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-center text-xs font-medium text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* ---- Bottom row: Chart + Recent Activity -------------------------- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Weekly Study Time chart */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Study Time
            </h2>
          </div>

          {weeklyChartData.every((d) => d.minutes === 0) ? (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No study data yet. Start a timer session!
            </p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} barSize={28}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                    unit="m"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [`${value} min`, 'Study time']}
                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="#a5b4fc"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No activity yet. Get started!
            </p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {activity.icon === 'timer' ? (
                      <Timer className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(activity.time)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
