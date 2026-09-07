import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import {
  ACADEMIC_BOARDS,
  ACADEMIC_CLASSES,
  ACADEMIC_SUBJECTS,
  getChaptersForSubject,
  getTopicsForChapter,
} from '../../data/curriculumData';

export interface AcademicTaxonomyValues {
  board: string;
  classGrade: string;
  subject: string;
  chapter: string;
  topic: string;
}

interface AcademicTaxonomyBarProps {
  values: AcademicTaxonomyValues;
  onChange: (next: AcademicTaxonomyValues) => void;
  className?: string;
  showClear?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export const AcademicTaxonomyBar: React.FC<AcademicTaxonomyBarProps> = ({
  values,
  onChange,
  className = '',
  showClear = false,
  disabled = false,
  compact = false,
}) => {
  const availableChapters = getChaptersForSubject(values.subject);
  const availableTopics = getTopicsForChapter(values.chapter, values.subject);

  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...values,
      board: e.target.value,
    });
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...values,
      classGrade: e.target.value,
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSubject = e.target.value;
    // Reset chapter and topic when subject changes if current chapter doesn't exist in new subject
    const newChapters = getChaptersForSubject(nextSubject);
    const chapterStillValid = newChapters.some((c) => c.name === values.chapter);
    onChange({
      ...values,
      subject: nextSubject,
      chapter: chapterStillValid ? values.chapter : '',
      topic: chapterStillValid ? values.topic : '',
    });
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextChapter = e.target.value;
    // Reset topic when chapter changes if topic not in new chapter
    const newTopics = getTopicsForChapter(nextChapter, values.subject);
    const topicStillValid = newTopics.includes(values.topic);
    onChange({
      ...values,
      chapter: nextChapter,
      topic: topicStillValid ? values.topic : '',
    });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...values,
      topic: e.target.value,
    });
  };

  const handleClear = () => {
    onChange({
      board: 'CBSE',
      classGrade: '',
      subject: '',
      chapter: '',
      topic: '',
    });
  };

  const hasFilter =
    values.board !== 'CBSE' ||
    Boolean(values.classGrade) ||
    Boolean(values.subject) ||
    Boolean(values.chapter) ||
    Boolean(values.topic);

  const selectContainerClass = compact
    ? 'relative w-full'
    : 'relative w-full';

  const selectClass = `w-full appearance-none rounded-lg border border-slate-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--bg-card)] px-3.5 py-2 pr-8 text-xs sm:text-sm font-medium text-slate-700 dark:text-[var(--text-primary)] shadow-sm outline-none transition hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#f39223] focus:ring-2 focus:ring-[#f39223]/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
    compact ? 'py-1.5 text-xs' : 'py-2 text-xs sm:text-sm'
  }`;

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 items-center">
        {/* 1. Board Selector (CBSE default) */}
        <div className={selectContainerClass}>
          <select
            aria-label="Academic Board"
            value={values.board || 'CBSE'}
            onChange={handleBoardChange}
            disabled={disabled}
            className={selectClass}
          >
            {ACADEMIC_BOARDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)]"
          />
        </div>

        {/* 2. Class Selector ("Select class") */}
        <div className={selectContainerClass}>
          <select
            aria-label="Select class"
            value={values.classGrade || ''}
            onChange={handleClassChange}
            disabled={disabled}
            className={`${selectClass} ${!values.classGrade ? 'text-slate-500 dark:text-[var(--text-muted)]' : ''}`}
          >
            <option value="">Select class</option>
            {ACADEMIC_CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)]"
          />
        </div>

        {/* 3. Subject Selector ("Select subject") */}
        <div className={selectContainerClass}>
          <select
            aria-label="Select subject"
            value={values.subject || ''}
            onChange={handleSubjectChange}
            disabled={disabled}
            className={`${selectClass} ${!values.subject ? 'text-slate-500 dark:text-[var(--text-muted)]' : ''}`}
          >
            <option value="">Select subject</option>
            {ACADEMIC_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)]"
          />
        </div>

        {/* 4. Chapter Selector ("Select chapter") */}
        <div className={selectContainerClass}>
          <select
            aria-label="Select chapter"
            value={values.chapter || ''}
            onChange={handleChapterChange}
            disabled={disabled}
            className={`${selectClass} ${!values.chapter ? 'text-slate-500 dark:text-[var(--text-muted)]' : ''}`}
          >
            <option value="">Select chapter</option>
            {availableChapters.map((ch) => (
              <option key={ch.id || ch.name} value={ch.name}>
                {ch.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)]"
          />
        </div>

        {/* 5. Topic Selector ("Select topic") */}
        <div className={selectContainerClass}>
          <select
            aria-label="Select topic"
            value={values.topic || ''}
            onChange={handleTopicChange}
            disabled={disabled}
            className={`${selectClass} ${!values.topic ? 'text-slate-500 dark:text-[var(--text-muted)]' : ''}`}
          >
            <option value="">Select topic</option>
            {availableTopics.map((top) => (
              <option key={top} value={top}>
                {top}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Clear / Reset action if enabled and filters are active */}
      {showClear && hasFilter && (
        <div className="flex justify-end pt-1.5">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#f39223] hover:underline cursor-pointer"
          >
            <RotateCcw size={12} />
            Reset taxonomy filters
          </button>
        </div>
      )}
    </div>
  );
};
