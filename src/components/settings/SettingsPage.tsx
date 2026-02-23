'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  School,
  Globe,
  Moon,
  Sun,
  Bell,
  Timer,
  Zap,
  LogOut,
  Download,
  Check,
  Crown,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/stores/useStore';
import { countryNames } from '@/lib/grading-systems';
import type { Country } from '@/lib/types';

// ─── Toggle Component ───────────────────────────────────────────────────────

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

function Toggle({ enabled, onChange, label, description, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-lavender-500/10 flex items-center justify-center text-lavender-500">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-lavender-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#1E1E32] ${
          enabled ? 'bg-lavender-500' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, description, icon, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1E1E32] rounded-2xl border border-cream-400 dark:border-dark-border shadow-soft"
    >
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-lavender-500/10 flex items-center justify-center text-lavender-500">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </motion.div>
  );
}

// ─── Number Input ─────────────────────────────────────────────────────────────

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

function NumberInput({ label, value, onChange, min = 1, max = 90, unit = 'minutes' }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= min && v <= max) onChange(v);
          }}
          className="w-20 rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 w-14">{unit}</span>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const updateSettings = useStore((s) => s.updateSettings);
  const logout = useStore((s) => s.logout);

  // Profile
  const [name, setName] = useState(user?.name ?? '');
  const [school, setSchool] = useState(user?.school ?? '');
  const [country, setCountry] = useState<Country>(user?.country ?? 'US');

  // Pomodoro
  const [pomodoroWork, setPomodoroWork] = useState(user?.settings?.pomodoroWork ?? 25);
  const [pomodoroBreak, setPomodoroBreak] = useState(user?.settings?.pomodoroBreak ?? 5);
  const [pomodorLongBreak, setPomodorLongBreak] = useState(user?.settings?.pomodorLongBreak ?? 15);

  const isDark = user?.settings?.theme === 'dark';
  const notificationsEnabled = user?.settings?.notifications ?? true;
  const isPro = user?.tier === 'pro';

  const handleSaveProfile = () => {
    updateUser({ name, school, country });
    toast.success('Profile updated');
  };

  const handleSavePomodoro = () => {
    updateSettings({
      pomodoroWork,
      pomodoroBreak,
      pomodorLongBreak,
    });
    toast.success('Study settings saved');
  };

  const handleToggleTheme = (dark: boolean) => {
    updateSettings({ theme: dark ? 'dark' : 'light' });
  };

  const handleToggleNotifications = (enabled: boolean) => {
    updateSettings({ notifications: enabled });
  };

  const handleLogout = () => {
    toast('Logged out', { icon: '👋' });
    logout();
  };

  const handleExport = () => {
    toast('Export coming soon', { icon: '📦' });
  };

  const handleUpgrade = () => {
    toast('Redirecting to checkout...', { icon: '✨' });
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your profile, preferences and account.
        </p>
      </div>

      {/* ── Profile Section ─────────────────────────────────────────── */}
      <Section title="Profile" description="Update your personal information" icon={<User size={18} />}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Display Name
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              School
            </label>
            <div className="relative">
              <School
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Your school or university"
                className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Country
            </label>
            <div className="relative">
              <Globe
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
                className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 appearance-none cursor-pointer"
              >
                {(Object.entries(countryNames) as [Country, string][]).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveProfile}
            className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Save Profile
          </button>
        </div>
      </Section>

      {/* ── Appearance Section ───────────────────────────────────────── */}
      <Section title="Appearance" description="Customize how StudyHub looks" icon={<Moon size={18} />}>
        <Toggle
          enabled={isDark}
          onChange={handleToggleTheme}
          label="Dark Mode"
          description={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
          icon={isDark ? <Moon size={16} /> : <Sun size={16} />}
        />
      </Section>

      {/* ── Notifications Section ────────────────────────────────────── */}
      <Section title="Notifications" description="Control your notification preferences" icon={<Bell size={18} />}>
        <Toggle
          enabled={notificationsEnabled}
          onChange={handleToggleNotifications}
          label="Push Notifications"
          description="Receive reminders for homework, study sessions and streaks"
          icon={<Bell size={16} />}
        />
      </Section>

      {/* ── Study Settings Section ───────────────────────────────────── */}
      <Section
        title="Study Settings"
        description="Configure your Pomodoro timer durations"
        icon={<Timer size={18} />}
      >
        <div className="space-y-3">
          <NumberInput
            label="Work Duration"
            value={pomodoroWork}
            onChange={setPomodoroWork}
            min={1}
            max={90}
          />
          <div className="border-t border-gray-100 dark:border-white/5" />
          <NumberInput
            label="Short Break Duration"
            value={pomodoroBreak}
            onChange={setPomodoroBreak}
            min={1}
            max={30}
          />
          <div className="border-t border-gray-100 dark:border-white/5" />
          <NumberInput
            label="Long Break Duration"
            value={pomodorLongBreak}
            onChange={setPomodorLongBreak}
            min={5}
            max={60}
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSavePomodoro}
            className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </Section>

      {/* ── Pro Upgrade Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-lavender-500 to-lavender-700 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-8 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={20} className="text-yellow-300" />
                <h2 className="text-xl font-bold">Upgrade to Pro</h2>
              </div>
              <p className="text-white/80 text-sm">Unlock the full StudyHub experience</p>
            </div>
            {isPro && (
              <span className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                <Check size={12} />
                Pro Active
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
            {[
              'AI flashcard generation',
              'AI quiz creation',
              'Unlimited storage',
              'Priority support',
              'Cloud sync',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div>
              <span className="text-3xl font-bold">$4.99</span>
              <span className="text-white/70 text-sm">/month</span>
            </div>
            {!isPro && (
              <button
                onClick={handleUpgrade}
                className="bg-white text-lavender-600 hover:bg-white/90 font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors shadow-md"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Danger Zone ─────────────────────────────────────────────── */}
      <Section
        title="Account"
        description="Manage your account and data"
        icon={<Shield size={18} />}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Export Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download all your study data</p>
            </div>
            <button
              onClick={handleExport}
              className="bg-cream-300 hover:bg-cream-400 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Download size={15} />
              Export
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Logout</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </Section>

      {/* Version info */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-2">
        StudyHub v1.0.0 &mdash; Made for students
      </p>
    </motion.div>
  );
}
