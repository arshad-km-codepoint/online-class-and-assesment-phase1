import type { LiveAssessmentQuestionType, BloomsTaxonomyLevel, QuestionLevel } from '../types';

export const questionTypeLabels: Record<Exclude<LiveAssessmentQuestionType, 'short_answer'>, string> = {
  mcq: 'Single choice',
  mmcq: 'Multiple choice',
  fill_in_blanks: 'Fill in the blanks',
  match_following: 'Matching pairs',
  step_ordering: 'Sequence ordering',
};

export const bloomsTaxonomyLevels: BloomsTaxonomyLevel[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

export const bloomsTaxonomyColors: Record<BloomsTaxonomyLevel, { bg: string; text: string; border: string }> = {
  Remember: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  Understand: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  Apply: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  Analyze: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  Evaluate: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  Create: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
};

export const questionLevels: QuestionLevel[] = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

export interface QuestionLevelMeta {
  level: QuestionLevel;
  tag: string;
  defaultPoints: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  sublabel: string;
  bg: string;
  text: string;
  border: string;
  activeRing: string;
  badgeClass: string;
}

export const questionLevelConfig: Record<QuestionLevel, QuestionLevelMeta> = {
  'Level 1': {
    level: 'Level 1',
    tag: 'Level 1',
    defaultPoints: 1,
    difficulty: 'Easy',
    description: 'Foundational & Direct Recall',
    sublabel: 'Basic concept checks & direct definitions',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    activeRing: 'ring-emerald-500 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
  'Level 2': {
    level: 'Level 2',
    tag: 'Level 2',
    defaultPoints: 2,
    difficulty: 'Medium',
    description: 'Intermediate & Application',
    sublabel: 'Standard multi-step problem solving',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    activeRing: 'ring-amber-500 border-amber-500 bg-amber-50/70 dark:bg-amber-950/60',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  },
  'Level 3': {
    level: 'Level 3',
    tag: 'Level 3',
    defaultPoints: 3,
    difficulty: 'Hard',
    description: 'Advanced & HOTS (Analytical)',
    sublabel: 'Complex derivations, reasoning & tricky proofs',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    activeRing: 'ring-purple-500 border-purple-500 bg-purple-50/70 dark:bg-purple-950/60',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
  'Level 4': {
    level: 'Level 4',
    tag: 'Level 4',
    defaultPoints: 4,
    difficulty: 'Hard',
    description: 'Expert & Olympiad Level',
    sublabel: 'Challenging multi-concept synthesis & Olympiad problems',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    activeRing: 'ring-rose-500 border-rose-500 bg-rose-50/70 dark:bg-rose-950/60',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  },
};

export function getQuestionLevel(q: { level?: QuestionLevel; difficulty?: string; marks?: number }): QuestionLevel {
  if (q.level === 'Level 1' || q.level === 'Level 2' || q.level === 'Level 3' || q.level === 'Level 4') {
    return q.level;
  }
  if (q.marks === 1 || q.difficulty === 'Easy') return 'Level 1';
  if (q.marks === 2 || q.difficulty === 'Medium') return 'Level 2';
  if (q.marks === 3) return 'Level 3';
  if ((q.marks && q.marks >= 4) || q.difficulty === 'Hard') return 'Level 4';
  return 'Level 2';
}

export const commonQuestionTags: string[] = [
  'level1',
  'level2',
  'level3',
  'level4',
];


