'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import { XP_VALUES } from '@/lib/gamification';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Trash2,
  FileText,
  ChevronLeft,
  Clock,
  Tag,
  FolderOpen,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return formatDate(dateStr);
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// ---------------------------------------------------------------------------
// Subject color pill
// ---------------------------------------------------------------------------

const SUBJECT_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
];

const subjectColorCache: Record<string, string> = {};

function getSubjectColor(subject: string): string {
  if (!subject) return 'bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400';
  if (!subjectColorCache[subject]) {
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    subjectColorCache[subject] = SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
  }
  return subjectColorCache[subject];
}

// ---------------------------------------------------------------------------
// NoteListItem
// ---------------------------------------------------------------------------

interface NoteListItemProps {
  id: string;
  title: string;
  content: string;
  subject: string;
  updatedAt: string;
  isActive: boolean;
  onClick: () => void;
}

function NoteListItem({ title, content, subject, updatedAt, isActive, onClick }: NoteListItemProps) {
  const preview = content.slice(0, 80).replace(/\n/g, ' ');

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 group',
        isActive
          ? 'bg-lavender-500/10 border-lavender-400/60 dark:bg-lavender-500/15 dark:border-lavender-500/50'
          : 'bg-white dark:bg-[#1E1E32] border-cream-400 dark:border-dark-border hover:border-lavender-300 dark:hover:border-lavender-600/40 hover:bg-lavender-50/40 dark:hover:bg-lavender-900/10'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={cn(
            'text-sm font-medium truncate flex-1',
            isActive ? 'text-lavender-700 dark:text-lavender-300' : 'text-gray-800 dark:text-gray-100'
          )}
        >
          {title || 'Untitled'}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
          {getRelativeTime(updatedAt)}
        </span>
      </div>
      {preview && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mb-2">{preview}</p>
      )}
      {subject && (
        <span
          className={cn(
            'inline-block text-[10px] font-medium px-2 py-0.5 rounded-full',
            getSubjectColor(subject)
          )}
        >
          {subject}
        </span>
      )}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Saved indicator
// ---------------------------------------------------------------------------

type SaveState = 'idle' | 'saving' | 'saved';

function SavedIndicator({ state }: { state: SaveState }) {
  return (
    <AnimatePresence mode="wait">
      {state === 'saving' && (
        <motion.span
          key="saving"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500"
        >
          <Clock className="w-3 h-3" />
          Saving…
        </motion.span>
      )}
      {state === 'saved' && (
        <motion.span
          key="saved"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1 text-xs text-emerald-500"
        >
          <Check className="w-3 h-3" />
          Saved
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, addXP } = useStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  // Editor local state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [folder, setFolder] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [xpAwarded, setXpAwarded] = useState<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSaveRef = useRef(false);

  // Derived: selected note object
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  // Derived: unique subjects for filter
  const subjects = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => { if (n.subject) set.add(n.subject); });
    return Array.from(set).sort();
  }, [notes]);

  // Filtered & sorted notes
  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes
      .filter((n) => {
        const matchesSearch =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q);
        const matchesSubject =
          subjectFilter === 'all' || n.subject === subjectFilter;
        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, subjectFilter]);

  // Sync editor when selection changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setSubject(selectedNote.subject);
      setFolder(selectedNote.folder);
      setSaveState('idle');
      isFirstSaveRef.current = !xpAwarded.has(selectedNote.id);
    } else {
      setTitle('');
      setContent('');
      setSubject('');
      setFolder('');
      setSaveState('idle');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [content]);

  // Debounced auto-save
  const scheduleSave = useCallback(
    (newTitle: string, newContent: string, newSubject: string, newFolder: string) => {
      if (!selectedId) return;
      setSaveState('saving');
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateNote(selectedId, {
          title: newTitle,
          content: newContent,
          subject: newSubject,
          folder: newFolder,
        });

        // Award XP on first save of this note
        if (isFirstSaveRef.current && !xpAwarded.has(selectedId)) {
          addXP(XP_VALUES.createNote);
          setXpAwarded((prev) => new Set(prev).add(selectedId));
          isFirstSaveRef.current = false;
          toast.success(`+${XP_VALUES.createNote} XP earned!`, { icon: '✨' });
        }

        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      }, 500);
    },
    [selectedId, updateNote, addXP, xpAwarded]
  );

  // Handler: title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    scheduleSave(val, content, subject, folder);
  };

  // Handler: content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    scheduleSave(title, val, subject, folder);
  };

  // Handler: subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSubject(val);
    scheduleSave(title, content, val, folder);
  };

  // Handler: folder change
  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFolder(val);
    scheduleSave(title, content, subject, val);
  };

  // Handler: create new note
  const handleNewNote = () => {
    const id = addNote({ title: 'Untitled', content: '', subject: '', folder: '' });
    setSelectedId(id);
    isFirstSaveRef.current = true;
    setMobileView('editor');
    // Focus title after mount
    requestAnimationFrame(() => {
      const input = document.getElementById('note-title-input');
      if (input) (input as HTMLInputElement).focus();
    });
  };

  // Handler: select note
  const handleSelectNote = (id: string) => {
    setSelectedId(id);
    setMobileView('editor');
  };

  // Handler: delete note
  const handleDeleteNote = () => {
    if (!selectedId) return;
    deleteNote(selectedId);
    setSelectedId(null);
    setMobileView('list');
    toast.success('Note deleted');
  };

  // Handler: back on mobile
  const handleBack = () => {
    setMobileView('list');
  };

  const wordCount = countWords(content);

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT PANEL — Notes List                                             */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={cn(
          'flex flex-col border-r border-cream-400 dark:border-dark-border bg-[#FAFAF8] dark:bg-[#16162A]',
          'lg:w-[300px] lg:flex lg:shrink-0',
          // Mobile: show only when in list view
          mobileView === 'list' ? 'flex w-full' : 'hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Notes</h1>
          <button
            onClick={handleNewNote}
            className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-cream-400 dark:border-dark-border bg-white dark:bg-[#2A2A40] pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400 text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Subject filter chips */}
        {subjects.length > 0 && (
          <div className="px-4 pb-3 shrink-0">
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setSubjectFilter('all')}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition-colors font-medium',
                  subjectFilter === 'all'
                    ? 'bg-lavender-500 text-white border-lavender-500'
                    : 'bg-white dark:bg-[#2A2A40] text-gray-600 dark:text-gray-300 border-cream-400 dark:border-dark-border hover:border-lavender-400'
                )}
              >
                All
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-colors font-medium',
                    subjectFilter === s
                      ? 'bg-lavender-500 text-white border-lavender-500'
                      : 'bg-white dark:bg-[#2A2A40] text-gray-600 dark:text-gray-300 border-cream-400 dark:border-dark-border hover:border-lavender-400'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 min-h-0">
          <AnimatePresence initial={false}>
            {filteredNotes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
              >
                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {searchQuery || subjectFilter !== 'all'
                    ? 'No matching notes'
                    : 'No notes yet'}
                </p>
                {!searchQuery && subjectFilter === 'all' && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Click "New Note" to get started
                  </p>
                )}
              </motion.div>
            ) : (
              filteredNotes.map((note) => (
                <NoteListItem
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.content}
                  subject={note.subject}
                  updatedAt={note.updatedAt}
                  isActive={note.id === selectedId}
                  onClick={() => handleSelectNote(note.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT PANEL — Editor                                                */}
      {/* ------------------------------------------------------------------ */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1E1E32]',
          // Mobile: show only when in editor view
          mobileView === 'editor' ? 'flex w-full' : 'hidden lg:flex'
        )}
      >
        <AnimatePresence mode="wait">
          {selectedNote ? (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full min-h-0"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-cream-400 dark:border-dark-border shrink-0 gap-3">
                {/* Mobile back */}
                <button
                  onClick={handleBack}
                  className="lg:hidden flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Notes
                </button>

                {/* Left meta */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                  <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 truncate">
                    Updated {getRelativeTime(selectedNote.updatedAt)}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <SavedIndicator state={saveState} />
                  <button
                    onClick={handleDeleteNote}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor body */}
              <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8 flex flex-col gap-3 min-h-0">
                {/* Title */}
                <input
                  id="note-title-input"
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Untitled"
                  className="text-xl font-semibold bg-transparent border-none outline-none w-full text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />

                {/* Subject + folder row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-lavender-50 dark:bg-lavender-900/20 border border-lavender-200 dark:border-lavender-800/50 rounded-full px-3 py-1">
                    <Tag className="w-3 h-3 text-lavender-400" />
                    <input
                      type="text"
                      value={subject}
                      onChange={handleSubjectChange}
                      placeholder="Subject"
                      className="bg-transparent border-none outline-none text-xs text-lavender-700 dark:text-lavender-300 placeholder:text-lavender-300 dark:placeholder:text-lavender-600 w-24"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-dark-border rounded-full px-3 py-1">
                    <FolderOpen className="w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      value={folder}
                      onChange={handleFolderChange}
                      placeholder="Folder"
                      className="bg-transparent border-none outline-none text-xs text-gray-600 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 w-24"
                    />
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-cream-400 dark:border-dark-border" />

                {/* Content */}
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing…"
                  rows={1}
                  className="flex-1 w-full resize-none bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600 min-h-[200px]"
                />
              </div>

              {/* Footer meta */}
              <div className="px-5 py-2.5 border-t border-cream-400 dark:border-dark-border flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 shrink-0 flex-wrap">
                <span>Created {formatDate(selectedNote.createdAt)}</span>
                <span>Updated {formatDate(selectedNote.updatedAt)}</span>
                {xpAwarded.has(selectedNote.id) && (
                  <span className="text-lavender-500 font-medium flex items-center gap-1">
                    ✨ +{XP_VALUES.createNote} XP earned
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              {/* Mobile back */}
              <button
                onClick={handleBack}
                className="lg:hidden absolute top-4 left-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Notes
              </button>

              <div className="w-16 h-16 rounded-2xl bg-lavender-50 dark:bg-lavender-900/20 flex items-center justify-center">
                <FileText className="w-8 h-8 text-lavender-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-300">
                  Select a note or create a new one
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Your notes will appear here
                </p>
              </div>
              <button
                onClick={handleNewNote}
                className="bg-lavender-500 hover:bg-lavender-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
