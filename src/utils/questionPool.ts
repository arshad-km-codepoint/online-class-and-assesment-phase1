import type { LiveAssessmentQuestionType, BloomsTaxonomyLevel } from '../types';

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
  Remember: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Understand: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Apply: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Analyze: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Evaluate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Create: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};
