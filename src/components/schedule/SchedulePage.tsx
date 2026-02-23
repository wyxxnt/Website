'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, MapPin, User, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/stores/useStore';
import {
  cn,
  getDayName,
  getDayNameShort,
  isOddWeek,
  subjectColors,
  getRandomColor,
} from '@/lib/utils';
import type { ScheduleEntry } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddClassForm {
  subject: string;
  teacher: string;
  room: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  weekType: 'all' | 'odd' | 'even';
  color: string;
}

const defaultForm = (): AddClassForm => ({
  subject: '',
  teacher: '',
  room: '',
  dayOfWeek: 0,
  startTime: '08:00',
  endTime: '09:00',
  weekType: 'all',
  color: getRandomColor(),
});

// ---------------------------------------------------------------------------
// AddClassModal
// ---------------------------------------------------------------------------

interface AddClassModalProps {
  onClose: () => void;
}

function AddClassModal({ onClose }: AddClassModalProps) {
  const addScheduleEntry = useStore((s) => s.addScheduleEntry);
  const [form, setForm] = useState<AddClassForm>(defaultForm());

  const set = <K extends keyof AddClassForm>(key: K, value: AddClassForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.subject.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (!form.startTime || !form.endTime) {
      toast.error('Start and end times are required');
      return;
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    addScheduleEntry(form);
    toast.success('Class added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#1E1E32] rounded-3xl p-6 shadow-2xl w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Class</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Teacher
            </label>
            <input
              type="text"
              placeholder="e.g. Mr. Smith"
              value={form.teacher}
              onChange={(e) => set('teacher', e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
          </div>

          {/* Room */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Room
            </label>
            <input
              type="text"
              placeholder="e.g. Room 101"
              value={form.room}
              onChange={(e) => set('room', e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Day of Week
            </label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => set('dayOfWeek', Number(e.target.value))}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            >
              {Array.from({ length: 7 }, (_, i) => (
                <option key={i} value={i}>
                  {getDayName(i)}
                </option>
              ))}
            </select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Start Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                End Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lavender-400"
              />
            </div>
          </div>

          {/* Week Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Week Type
            </label>
            <select
              value={form.weekType}
              onChange={(e) => set('weekType', e.target.value as 'all' | 'odd' | 'even')}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            >
              <option value="all">All weeks</option>
              <option value="odd">Odd weeks only</option>
              <option value="even">Even weeks only</option>
            </select>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {subjectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('color', color)}
                  style={{ backgroundColor: color }}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none',
                    form.color === color
                      ? 'ring-2 ring-offset-2 ring-lavender-500 dark:ring-offset-[#1E1E32] scale-110'
                      : ''
                  )}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-cream-300 hover:bg-cream-400 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            Save Class
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClassCard
// ---------------------------------------------------------------------------

interface ClassCardProps {
  entry: ScheduleEntry;
  index: number;
}

function ClassCard({ entry, index }: ClassCardProps) {
  const deleteScheduleEntry = useStore((s) => s.deleteScheduleEntry);

  const handleDelete = () => {
    deleteScheduleEntry(entry.id);
    toast.success('Class removed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group relative flex items-stretch bg-white dark:bg-[#1E1E32] rounded-2xl border border-gray-100 dark:border-[#3A3A56] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Colored left border */}
      <div
        className="w-1 flex-shrink-0 rounded-l-2xl"
        style={{ backgroundColor: entry.color }}
      />

      <div className="flex-1 flex items-center justify-between px-4 py-3.5 min-w-0">
        <div className="min-w-0">
          {/* Subject */}
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate text-sm">
            {entry.subject}
          </p>

          {/* Time */}
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={11} className="flex-shrink-0" />
            <span>
              {entry.startTime} – {entry.endTime}
            </span>
          </div>

          {/* Teacher + Room */}
          <div className="flex items-center gap-3 mt-1">
            {entry.teacher && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <User size={11} className="flex-shrink-0" />
                <span className="truncate max-w-[120px]">{entry.teacher}</span>
              </div>
            )}
            {entry.room && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate max-w-[80px]">{entry.room}</span>
              </div>
            )}
          </div>
        </div>

        {/* Week type badge + delete */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {entry.weekType !== 'all' && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-300 uppercase tracking-wide">
              {entry.weekType}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            aria-label="Delete class"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SchedulePage
// ---------------------------------------------------------------------------

export default function SchedulePage() {
  const schedule = useStore((s) => s.schedule);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // Default to today's day (JS: 0=Sunday, convert to 0=Monday)
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
  const [showAddModal, setShowAddModal] = useState(false);

  const oddWeek = isOddWeek();

  // Filter entries for the selected day, respecting week type
  const dayEntries = schedule
    .filter((entry) => {
      if (entry.dayOfWeek !== selectedDay) return false;
      if (entry.weekType === 'all') return true;
      if (entry.weekType === 'odd') return oddWeek;
      if (entry.weekType === 'even') return !oddWeek;
      return false;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#16162A] pb-16">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-[#FAFAF8]/80 dark:bg-[#16162A]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#3A3A56]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lavender-100 dark:bg-lavender-900/30">
              <CalendarDays size={20} className="text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Schedule</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {oddWeek ? 'Odd week' : 'Even week'} &middot; Week {getWeekNumber()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Class</span>
          </button>
        </div>

        {/* Week type indicator */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          <span
            className={cn(
              'text-xs px-3 py-1 rounded-full font-medium transition-colors',
              oddWeek
                ? 'bg-lavender-500 text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
            )}
          >
            Odd weeks
          </span>
          <span
            className={cn(
              'text-xs px-3 py-1 rounded-full font-medium transition-colors',
              !oddWeek
                ? 'bg-lavender-500 text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
            )}
          >
            Even weeks
          </span>
        </div>

        {/* Day tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {Array.from({ length: 7 }, (_, i) => {
              const count = schedule.filter((e) => {
                if (e.dayOfWeek !== i) return false;
                if (e.weekType === 'all') return true;
                if (e.weekType === 'odd') return oddWeek;
                if (e.weekType === 'even') return !oddWeek;
                return false;
              }).length;
              const isSelected = selectedDay === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium transition-colors flex-shrink-0 min-w-[52px]',
                    isSelected
                      ? 'bg-lavender-500 text-white shadow-sm'
                      : 'bg-white dark:bg-[#1E1E32] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-[#3A3A56] hover:border-lavender-300 dark:hover:border-lavender-600'
                  )}
                >
                  <span className="font-semibold">{getDayNameShort(i)}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'mt-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold',
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day content */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
          >
            {dayEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <CalendarDays size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-base font-medium text-gray-400 dark:text-gray-500">
                  No classes on {getDayName(selectedDay)}
                </p>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">
                  Tap "Add Class" to schedule something
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {getDayName(selectedDay)} &middot; {dayEntries.length} class
                  {dayEntries.length !== 1 ? 'es' : ''}
                </p>
                {dayEntries.map((entry, idx) => (
                  <ClassCard key={entry.id} entry={entry} index={idx} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Class Modal */}
      <AnimatePresence>
        {showAddModal && <AddClassModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}
