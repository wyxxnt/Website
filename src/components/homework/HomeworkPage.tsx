'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  BookOpen,
  AlertCircle,
  Clock,
  PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '@/stores/useStore';
import { XP_VALUES } from '@/lib/gamification';
import { cn, isOverdue, isToday, getDaysUntil } from '@/lib/utils';
import type { Homework } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';

interface AddHomeworkForm {
  subject: string;
  task: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const defaultForm = (): AddHomeworkForm => ({
  subject: '',
  task: '',
  description: '',
  dueDate: '',
  priority: 'medium',
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function priorityBorderColor(priority: 'low' | 'medium' | 'high'): string {
  if (priority === 'high') return '#EF4444';   // red-500
  if (priority === 'medium') return '#F59E0B'; // amber-500
  return '#22C55E';                             // green-500
}

function priorityBadgeClass(priority: 'low' | 'medium' | 'high'): string {
  if (priority === 'high')
    return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
  if (priority === 'medium')
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
  return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
}

function statusBadgeClass(status: Homework['status']): string {
  if (status === 'completed')
    return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
  if (status === 'in_progress')
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  return 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400';
}

function statusLabel(status: Homework['status']): string {
  if (status === 'in_progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

function formatDueDate(dueDate: string): { label: string; className: string } {
  if (!dueDate) return { label: 'No due date', className: 'text-gray-400 dark:text-gray-500' };

  if (isOverdue(dueDate)) {
    const days = Math.abs(getDaysUntil(dueDate));
    return {
      label: days === 1 ? 'Overdue by 1 day' : `Overdue by ${days} days`,
      className: 'text-red-500 dark:text-red-400',
    };
  }
  if (isToday(dueDate)) {
    return { label: 'Due today', className: 'text-amber-500 dark:text-amber-400' };
  }
  const days = getDaysUntil(dueDate);
  if (days === 1) {
    return { label: 'Due tomorrow', className: 'text-amber-500 dark:text-amber-400' };
  }

  const d = new Date(dueDate);
  const label = `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return { label, className: 'text-gray-500 dark:text-gray-400' };
}

// ---------------------------------------------------------------------------
// AddHomeworkModal
// ---------------------------------------------------------------------------

interface AddHomeworkModalProps {
  onClose: () => void;
}

function AddHomeworkModal({ onClose }: AddHomeworkModalProps) {
  const addHomework = useStore((s) => s.addHomework);
  const [form, setForm] = useState<AddHomeworkForm>(defaultForm());

  const set = <K extends keyof AddHomeworkForm>(key: K, value: AddHomeworkForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!form.task.trim()) {
      toast.error('Task name is required');
      return;
    }
    if (!form.dueDate) {
      toast.error('Due date is required');
      return;
    }
    addHomework({
      subject: form.subject.trim(),
      task: form.task.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'pending',
    });
    toast.success('Homework added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#1E1E32] rounded-3xl p-6 shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Add Homework</h2>
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

          {/* Task */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Task <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Solve exercises 1–15"
              value={form.task}
              onChange={(e) => set('task', e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Description <span className="text-gray-300 dark:text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Additional details..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400 resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Due Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-white dark:bg-[#2A2A40] px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-lavender-400"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-colors border',
                    form.priority === p
                      ? p === 'high'
                        ? 'bg-red-500 border-red-500 text-white'
                        : p === 'medium'
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-[#2A2A40] border-gray-200 dark:border-[#3A3A56] text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                >
                  {p}
                </button>
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
            Add Homework
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HomeworkCard
// ---------------------------------------------------------------------------

interface HomeworkCardProps {
  hw: Homework;
  index: number;
}

function HomeworkCard({ hw, index }: HomeworkCardProps) {
  const updateHomework = useStore((s) => s.updateHomework);
  const deleteHomework = useStore((s) => s.deleteHomework);
  const addHomeworkStep = useStore((s) => s.addHomeworkStep);
  const toggleHomeworkStep = useStore((s) => s.toggleHomeworkStep);
  const addXP = useStore((s) => s.addXP);

  const [expanded, setExpanded] = useState(false);
  const [newStepText, setNewStepText] = useState('');

  const due = formatDueDate(hw.dueDate);
  const overdue = hw.status !== 'completed' && isOverdue(hw.dueDate);

  const completedSteps = hw.steps.filter((s) => s.completed).length;
  const totalSteps = hw.steps.length;

  const handleMarkInProgress = () => {
    updateHomework(hw.id, { status: 'in_progress' });
    toast.success('Marked as in progress');
  };

  const handleMarkComplete = () => {
    updateHomework(hw.id, { status: 'completed' });
    addXP(XP_VALUES.completeHomework);
    toast.success(`Homework completed! +${XP_VALUES.completeHomework} XP`);
  };

  const handleDelete = () => {
    deleteHomework(hw.id);
    toast.success('Homework deleted');
  };

  const handleAddStep = () => {
    const text = newStepText.trim();
    if (!text) return;
    addHomeworkStep(hw.id, text);
    setNewStepText('');
  };

  const handleStepKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={cn(
        'group bg-white dark:bg-[#1E1E32] rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md',
        overdue
          ? 'border-red-200 dark:border-red-900/40'
          : 'border-gray-100 dark:border-[#3A3A56]'
      )}
    >
      {/* Main card row */}
      <div className="flex items-stretch">
        {/* Priority colored left border */}
        <div
          className="w-1 flex-shrink-0"
          style={{ backgroundColor: priorityBorderColor(hw.priority) }}
        />

        <div className="flex-1 px-4 py-3.5 min-w-0">
          {/* Top row: subject + badges + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-lavender-600 dark:text-lavender-400 uppercase tracking-wide truncate">
                {hw.subject}
              </p>
              <p
                className={cn(
                  'font-semibold text-sm mt-0.5 text-gray-800 dark:text-gray-100',
                  hw.status === 'completed' && 'line-through text-gray-400 dark:text-gray-500'
                )}
              >
                {hw.task}
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {hw.status === 'pending' && (
                <button
                  onClick={handleMarkInProgress}
                  title="Mark as In Progress"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <PlayCircle size={15} />
                </button>
              )}
              {hw.status !== 'completed' && (
                <button
                  onClick={handleMarkComplete}
                  title="Mark as Complete"
                  className="p-1.5 rounded-xl text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  <CheckCircle2 size={15} />
                </button>
              )}
              <button
                onClick={handleDelete}
                title="Delete"
                className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Description */}
          {hw.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
              {hw.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {/* Due date */}
            <div className={cn('flex items-center gap-1 text-xs font-medium', due.className)}>
              {overdue ? <AlertCircle size={11} /> : <Clock size={11} />}
              <span>{due.label}</span>
            </div>

            {/* Priority badge */}
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
                priorityBadgeClass(hw.priority)
              )}
            >
              {hw.priority}
            </span>

            {/* Status badge */}
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                statusBadgeClass(hw.status)
              )}
            >
              {statusLabel(hw.status)}
            </span>

            {/* Steps progress */}
            {totalSteps > 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                {completedSteps}/{totalSteps} steps
              </span>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-lavender-500 dark:hover:text-lavender-400 transition-colors"
            >
              {expanded ? (
                <>
                  <span>Hide steps</span>
                  <ChevronUp size={13} />
                </>
              ) : (
                <>
                  <span>Steps{totalSteps > 0 ? ` (${totalSteps})` : ''}</span>
                  <ChevronDown size={13} />
                </>
              )}
            </button>
          </div>

          {/* Steps progress bar */}
          {totalSteps > 0 && (
            <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-lavender-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Steps section (expandable) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-[#3A3A56] px-4 pb-4 pt-3 ml-1">
              {/* Steps list */}
              {hw.steps.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                  No steps yet. Add one below.
                </p>
              ) : (
                <ul className="space-y-2 mb-3">
                  {hw.steps.map((step) => (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 group/step"
                    >
                      <button
                        onClick={() => toggleHomeworkStep(hw.id, step.id)}
                        className="mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-lavender-500 dark:hover:text-lavender-400 transition-colors"
                      >
                        {step.completed ? (
                          <CheckCircle2
                            size={16}
                            className="text-lavender-500 dark:text-lavender-400"
                          />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <span
                        className={cn(
                          'text-sm leading-snug',
                          step.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-700 dark:text-gray-200'
                        )}
                      >
                        {step.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}

              {/* Add step input */}
              {hw.status !== 'completed' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a step..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={handleStepKeyDown}
                    className="flex-1 rounded-xl border border-cream-400 dark:border-[#3A3A56] bg-[#FAFAF8] dark:bg-[#2A2A40] px-3 py-1.5 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                  <button
                    onClick={handleAddStep}
                    disabled={!newStepText.trim()}
                    className="p-1.5 rounded-xl bg-lavender-500 hover:bg-lavender-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// HomeworkPage
// ---------------------------------------------------------------------------

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
];

export default function HomeworkPage() {
  const homework = useStore((s) => s.homework);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Counts per tab
  const counts: Record<FilterTab, number> = {
    all: homework.length,
    pending: homework.filter((h) => h.status === 'pending').length,
    in_progress: homework.filter((h) => h.status === 'in_progress').length,
    completed: homework.filter((h) => h.status === 'completed').length,
    overdue: homework.filter((h) => h.status !== 'completed' && isOverdue(h.dueDate)).length,
  };

  // Filter homework
  const filtered = homework.filter((h) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'overdue') return h.status !== 'completed' && isOverdue(h.dueDate);
    return h.status === activeFilter;
  });

  // Sort: overdue first, then by dueDate ascending, then no-date last
  const sorted = [...filtered].sort((a, b) => {
    const aOverdue = a.status !== 'completed' && isOverdue(a.dueDate);
    const bOverdue = b.status !== 'completed' && isOverdue(b.dueDate);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#16162A] pb-16">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-[#FAFAF8]/80 dark:bg-[#16162A]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#3A3A56]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lavender-100 dark:bg-lavender-900/30">
              <BookOpen size={20} className="text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Homework</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {counts.pending + counts.in_progress} active &middot; {counts.completed} done
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Homework</span>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count = counts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0',
                    isActive
                      ? tab.key === 'overdue'
                        ? 'bg-red-500 text-white'
                        : 'bg-lavender-500 text-white'
                      : 'bg-white dark:bg-[#1E1E32] text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-[#3A3A56] hover:border-lavender-300 dark:hover:border-lavender-600'
                  )}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1',
                        isActive
                          ? 'bg-white/25 text-white'
                          : tab.key === 'overdue'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
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

      {/* Homework list */}
      <div className="max-w-2xl mx-auto px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {sorted.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <BookOpen size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                {activeFilter === 'all' ? (
                  <>
                    <p className="text-base font-medium text-gray-400 dark:text-gray-500">
                      No homework yet!
                    </p>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1 max-w-xs">
                      You're all caught up. Tap "Add Homework" to track your next assignment.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-medium text-gray-400 dark:text-gray-500">
                      No {FILTER_TABS.find((t) => t.key === activeFilter)?.label.toLowerCase()} homework
                    </p>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">
                      {activeFilter === 'overdue'
                        ? 'Great job staying on top of things!'
                        : 'Nothing to show here right now.'}
                    </p>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  {FILTER_TABS.find((t) => t.key === activeFilter)?.label} &middot; {sorted.length}{' '}
                  item{sorted.length !== 1 ? 's' : ''}
                </p>
                {sorted.map((hw, idx) => (
                  <HomeworkCard key={hw.id} hw={hw} index={idx} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Homework Modal */}
      <AnimatePresence>
        {showAddModal && <AddHomeworkModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
