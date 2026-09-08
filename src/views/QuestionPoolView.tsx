import { useState } from 'react';
import { Plus, ArrowLeft, Save, Trash2, AlertCircle, Tag, X, Sparkles } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { QuestionPoolBrowser } from '../components/QuestionPoolBrowser';
import { AIQuestionGenerator } from '../components/AIQuestionGenerator';
import {
  questionTypeLabels,
  bloomsTaxonomyLevels,
  questionLevels,
  questionLevelConfig,
  getQuestionLevel,
} from '../utils/questionPool';
import {
  ACADEMIC_BOARDS,
  ACADEMIC_CLASSES,
  ACADEMIC_SUBJECTS,
  getChaptersForSubject,
  getTopicsForChapter,
} from '../data/curriculumData';
import type { LiveAssessmentQuestionType, PoolQuestion, BloomsTaxonomyLevel, QuestionLevel } from '../types';

const control = 'mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 placeholder:text-[var(--text-muted)]';
const lines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

function newQuestion(type: LiveAssessmentQuestionType = 'mcq'): PoolQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    prompt: '',
    board: 'CBSE',
    classGrade: 'Class 10',
    subject: 'Physics',
    chapter: 'Electricity & Electromagnetic Induction',
    topic: "Ohm's Law & Resistance",
    level: 'Level 1',
    difficulty: 'Easy',
    bloomsTaxonomy: 'Apply',
    marks: 1,
    tags: ['NCERT'],
    ...(type === 'mcq' ? { options: ['', '', '', ''], correctOptionIndex: 0 } : {}),
    ...(type === 'mmcq' ? { options: ['', '', '', ''], correctOptionIndices: [0], minSelections: 1 } : {}),
    ...(type === 'fill_in_blanks' ? { blankSlots: [{ id: crypto.randomUUID(), label: 'Blank 1', sentencePrefix: '', sentenceSuffix: '', correctAnswer: '' }] } : {}),
    ...(type === 'match_following' ? { matchingPairs: [1, 2].map(() => ({ id: crypto.randomUUID(), leftText: '', rightText: '' })) } : {}),
  };
}

export function QuestionPoolView() {
  const { savePoolQuestion, deletePoolQuestion, addToast, questionPool, setActiveTab } = useExam();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [draft, setDraft] = useState<PoolQuestion | null>(null);
  const [deleting, setDeleting] = useState<PoolQuestion | null>(null);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState('');
  const [distractors, setDistractors] = useState('');
  const [wordBank, setWordBank] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const edit = (q: PoolQuestion) => {
    const currentLevel = getQuestionLevel(q);
    setDraft({
      ...structuredClone(q),
      level: q.level || currentLevel,
      tags: q.tags || [],
    });
    setError('');
    setSteps(q.orderedSteps?.join('\n') || '');
    setDistractors(q.distractorSteps?.join('\n') || '');
    setWordBank(q.blankOptions?.join('\n') || '');
    setIsCustomTopic(false);
    setTagInput('');
  };

  const update = (value: Partial<PoolQuestion>) => setDraft(prev => prev ? { ...prev, ...value } : prev);

  const save = () => {
    if (!draft) return;
    const currentLevel = draft.level || getQuestionLevel(draft);
    const q: PoolQuestion = {
      ...draft,
      prompt: draft.prompt.trim(),
      board: draft.board || 'CBSE',
      classGrade: draft.classGrade || 'Class 10',
      subject: draft.subject.trim(),
      chapter: draft.chapter?.trim() || '',
      topic: draft.topic.trim(),
      level: currentLevel,
      difficulty: draft.difficulty || questionLevelConfig[currentLevel].difficulty,
      marks: Number(draft.marks) || questionLevelConfig[currentLevel].defaultPoints,
      tags: (draft.tags || []).map(t => t.trim()).filter(Boolean),
      bloomsTaxonomy: draft.bloomsTaxonomy || 'Apply',
    };
    let issue = '';
    if (!q.prompt || !q.subject || !q.topic) issue = 'Enter the question, subject and topic.';
    else if (!Number.isFinite(q.marks) || q.marks <= 0) issue = 'Marks must be greater than zero.';
    else if (q.type === 'mcq' || q.type === 'mmcq') {
      q.options = q.options?.map(option => option.trim());
      if (!q.options || q.options.length < 2 || q.options.some(option => !option)) issue = 'Provide at least two options and fill in every option.';
      else if (new Set(q.options).size !== q.options.length) issue = 'Each answer option must be different.';
      else if (q.type === 'mcq' && (q.correctOptionIndex === undefined || !q.options[q.correctOptionIndex])) issue = 'Select the correct answer.';
      else if (q.type === 'mmcq' && (!q.correctOptionIndices?.length || q.correctOptionIndices.some(i => !q.options?.[i]))) issue = 'Select at least one correct answer.';
    } else if (q.type === 'fill_in_blanks') {
      q.blankOptions = lines(wordBank);
      if (!q.blankSlots?.length || q.blankSlots.some(slot => !slot.correctAnswer.trim() || (!slot.sentencePrefix.trim() && !slot.sentenceSuffix?.trim()))) issue = 'Every blank needs sentence context and a correct answer.';
      else if (q.blankOptions.length && q.blankSlots.some(slot => !q.blankOptions?.includes(slot.correctAnswer.trim()))) issue = 'Include every correct answer in the word bank, or leave the word bank empty.';
      q.blankSlots = q.blankSlots?.map(slot => ({ ...slot, correctAnswer: slot.correctAnswer.trim() }));
    } else if (q.type === 'match_following' && (!q.matchingPairs || q.matchingPairs.length < 2 || q.matchingPairs.some(pair => !pair.leftText.trim() || !pair.rightText.trim()))) issue = 'Provide at least two complete matching pairs.';
    else if (q.type === 'step_ordering') {
      q.orderedSteps = lines(steps); q.distractorSteps = lines(distractors);
      if (q.orderedSteps.length < 2) issue = 'Enter at least two steps in their correct order.';
      else if (new Set([...q.orderedSteps, ...q.distractorSteps]).size !== q.orderedSteps.length + q.distractorSteps.length) issue = 'Steps and distractors must all be different.';
    }
    if (issue) { setError(issue); return; }
    if (savePoolQuestion(q)) { setDraft(null); addToast('Question saved', 'The question is available in your pool and assessment search.', 'success'); }
  };

  const isEditingExisting = draft && questionPool.some(q => q.id === draft.id);

  if (showAIGenerator) {
    return (
      <PageWrapper
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
          { label: 'Question Pool', onClick: () => setShowAIGenerator(false) },
          { label: 'AI Question Generator', active: true },
        ]}
        title="Quick Question Paper Generator"
        subtitle="Configure syllabus criteria, question types, and taxonomy levels to auto-generate curriculum-aligned questions."
        onBack={() => setShowAIGenerator(false)}
      >
        <AIQuestionGenerator onClose={() => setShowAIGenerator(false)} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
        { label: 'Question Pool', onClick: draft ? () => setDraft(null) : undefined, active: !draft },
        ...(draft ? [{ label: isEditingExisting ? 'Edit Question' : 'Create Question', active: true }] : []),
      ]}
      title={draft ? (isEditingExisting ? 'Edit Question' : 'Create Question') : 'Question Pool'}
      subtitle={draft ? 'Include the answer key so the question is ready for an assessment.' : 'Build once. Reuse in any assessment. Saved in this browser.'}
      onBack={draft ? () => setDraft(null) : undefined}
      actions={!draft ? (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAIGenerator(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-300 dark:border-orange-700/60 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
          >
            <Sparkles size={16} className="text-amber-100" />
            Generate with AI
          </button>
          <button
            type="button"
            onClick={() => edit(newQuestion())}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
          >
            <Plus size={17} />
            Create Question
          </button>
        </div>
      ) : undefined}
    >
      {!draft ? (
        <div className="space-y-5">
          {deleting && (
            <div role="alert" className="rounded-2xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4 space-y-3 shadow-sm">
              <p className="text-sm text-[var(--status-error-text)]">
                Delete “{deleting.prompt}” from the pool? Questions already added to assessments are kept.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (deletePoolQuestion(deleting.id)) {
                      setDeleting(null);
                      addToast('Question deleted', 'The question was removed from the pool.', 'success');
                    }
                  }}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Delete question
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(null)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <QuestionPoolBrowser onEdit={q => { setDeleting(null); edit(q); }} onDelete={setDeleting} />
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); save(); }} className="w-full space-y-6">
          {error && (
            <div role="alert" className="rounded-xl bg-[var(--status-error-bg)] border border-[var(--status-error-border)] p-4 text-sm text-[var(--status-error-text)] flex items-center gap-3">
              <AlertCircle className="shrink-0 text-red-600" size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Column: Question Content & Answers */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-px w-4 bg-[var(--primary)]" />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                    Question Prompt & Answers
                  </h2>
                </div>

                <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Question Prompt <span className="text-red-500 font-semibold">*</span>
                  <textarea
                    aria-label="Question"
                    required
                    rows={4}
                    className={control}
                    value={draft.prompt}
                    onChange={e => update({ prompt: e.target.value })}
                    placeholder="Enter your question prompt here…"
                  />
                </label>

                {(draft.type === 'mcq' || draft.type === 'mmcq') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Answer Options</p>
                      <span className="text-xs text-[var(--text-muted)]">
                        {draft.type === 'mcq' ? 'Select the single correct radio option' : 'Check all options that apply'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {draft.options?.map((option, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-2.5 transition-colors focus-within:border-orange-400">
                          <input
                            aria-label={`Correct answer ${i + 1}`}
                            type={draft.type === 'mcq' ? 'radio' : 'checkbox'}
                            name="correct-answer"
                            checked={draft.type === 'mcq' ? draft.correctOptionIndex === i : draft.correctOptionIndices?.includes(i) || false}
                            onChange={e => update(draft.type === 'mcq' ? { correctOptionIndex: i } : { correctOptionIndices: e.target.checked ? [...(draft.correctOptionIndices || []), i] : draft.correctOptionIndices?.filter(index => index !== i) })}
                            className="accent-orange-500 h-4 w-4 cursor-pointer shrink-0 ml-1"
                          />
                          <input
                            required
                            aria-label={`Option ${i + 1}`}
                            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                            placeholder={`Option ${i + 1}`}
                            value={option}
                            onChange={e => update({ options: draft.options?.map((value, index) => index === i ? e.target.value : value) })}
                          />
                          <button
                            type="button"
                            aria-label={`Remove option ${i + 1}`}
                            disabled={(draft.options?.length || 0) <= 2}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-black/5 transition shrink-0"
                            onClick={() => update({
                              options: draft.options?.filter((_, index) => index !== i),
                              correctOptionIndex: draft.correctOptionIndex === i ? undefined : draft.correctOptionIndex !== undefined && draft.correctOptionIndex > i ? draft.correctOptionIndex - 1 : draft.correctOptionIndex,
                              correctOptionIndices: draft.correctOptionIndices?.filter(index => index !== i).map(index => index > i ? index - 1 : index)
                            })}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => update({ options: [...(draft.options || []), ''] })}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer pt-1"
                    >
                      <Plus size={15} /> Add option
                    </button>
                  </div>
                )}

                {draft.type === 'fill_in_blanks' && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Sentence blanks</p>
                    {draft.blankSlots?.map((slot, i) => (
                      <div key={slot.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[var(--text-primary)]">Blank {i + 1}</p>
                          <button
                            type="button"
                            disabled={draft.blankSlots!.length <= 1}
                            onClick={() => update({ blankSlots: draft.blankSlots?.filter(s => s.id !== slot.id) })}
                            className="text-xs text-[var(--status-error-icon)] hover:underline disabled:opacity-30 cursor-pointer"
                          >
                            Remove blank
                          </button>
                        </div>
                        {(['sentencePrefix', 'correctAnswer', 'sentenceSuffix'] as const).map((key, j) => (
                          <label key={key} className="block text-xs font-medium text-[var(--text-secondary)]">
                            {['Text before blank', 'Correct answer', 'Text after blank'][j]}
                            <input
                              className={control}
                              value={slot[key] || ''}
                              onChange={e => update({ blankSlots: draft.blankSlots?.map(s => s.id === slot.id ? { ...s, [key]: e.target.value } : s) })}
                            />
                          </label>
                        ))}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                      onClick={() => update({ blankSlots: [...(draft.blankSlots || []), { id: crypto.randomUUID(), label: `Blank ${(draft.blankSlots?.length || 0) + 1}`, sentencePrefix: '', sentenceSuffix: '', correctAnswer: '' }] })}
                    >
                      <Plus size={15} /> Add blank
                    </button>
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)] pt-2">
                      Word bank (optional, one option per line)
                      <textarea className={control} rows={3} value={wordBank} onChange={e => setWordBank(e.target.value)} placeholder="Type optional decoy or word bank items here..." />
                    </label>
                  </div>
                )}

                {draft.type === 'match_following' && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Correct matching pairs</p>
                    {draft.matchingPairs?.map((pair, i) => (
                      <div key={pair.id} className="flex items-center gap-2">
                        <input required aria-label={`Pair ${i + 1} left`} placeholder="Column A" className={control} value={pair.leftText} onChange={e => update({ matchingPairs: draft.matchingPairs?.map(p => p.id === pair.id ? { ...p, leftText: e.target.value } : p) })} />
                        <span className="text-[var(--text-muted)] text-lg">→</span>
                        <input required aria-label={`Pair ${i + 1} right`} placeholder="Column B" className={control} value={pair.rightText} onChange={e => update({ matchingPairs: draft.matchingPairs?.map(p => p.id === pair.id ? { ...p, rightText: e.target.value } : p) })} />
                        <button type="button" aria-label={`Remove pair ${i + 1}`} disabled={draft.matchingPairs!.length <= 2} className="p-2 text-[var(--text-secondary)] hover:text-red-500 disabled:opacity-30 cursor-pointer" onClick={() => update({ matchingPairs: draft.matchingPairs?.filter(p => p.id !== pair.id) })}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer" onClick={() => update({ matchingPairs: [...(draft.matchingPairs || []), { id: crypto.randomUUID(), leftText: '', rightText: '' }] })}>
                      <Plus size={15} /> Add pair
                    </button>
                  </div>
                )}

                {draft.type === 'step_ordering' && (
                  <div className="space-y-4">
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Steps in correct order (one per line)
                      <textarea required rows={5} className={control} value={steps} onChange={e => setSteps(e.target.value)} placeholder="Step 1&#10;Step 2&#10;Step 3..." />
                    </label>
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Distractors (optional, one per line)
                      <textarea rows={3} className={control} value={distractors} onChange={e => setDistractors(e.target.value)} placeholder="Incorrect / decoy step..." />
                    </label>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--border-color)]">
                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Answer Explanation / Rationale (optional)
                    <textarea
                      rows={3}
                      className={control}
                      value={draft.explanation || ''}
                      onChange={e => update({ explanation: e.target.value })}
                      placeholder="Provide helpful context or explanation shown to students after evaluation…"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Metadata & Academic Mapping */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-6">
              {/* Academic Mapping Card */}
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-4 bg-[var(--primary)]" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                      Question Details & Academic Mapping
                    </h2>
                  </div>
                  <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                    {isEditingExisting ? 'Editing' : 'Draft'}
                  </span>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Question type
                    <select
                      aria-label="Question type"
                      className={control}
                      value={draft.type}
                      onChange={e => {
                        const next = newQuestion(e.target.value as LiveAssessmentQuestionType);
                        edit({
                          ...next,
                          id: draft.id,
                          prompt: draft.prompt,
                          subject: draft.subject,
                          topic: draft.topic,
                          difficulty: draft.difficulty,
                          bloomsTaxonomy: draft.bloomsTaxonomy,
                          marks: draft.marks,
                          explanation: draft.explanation,
                          level: draft.level,
                          tags: draft.tags,
                        });
                      }}
                    >
                      {Object.entries(questionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Board <span className="text-red-500 font-semibold">*</span>
                      <select
                        aria-label="Board"
                        className={control}
                        value={draft.board || 'CBSE'}
                        onChange={e => update({ board: e.target.value })}
                      >
                        {ACADEMIC_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </label>

                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Class / Grade <span className="text-red-500 font-semibold">*</span>
                      <select
                        aria-label="Class"
                        className={control}
                        value={draft.classGrade || 'Class 10'}
                        onChange={e => update({ classGrade: e.target.value })}
                      >
                        {ACADEMIC_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>

                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Subject <span className="text-red-500 font-semibold">*</span>
                    <select
                      aria-label="Subject"
                      className={control}
                      value={draft.subject}
                      onChange={e => {
                        const nextSub = e.target.value;
                        const chapters = getChaptersForSubject(nextSub);
                        update({
                          subject: nextSub,
                          chapter: chapters[0]?.name || '',
                          topic: chapters[0]?.topics[0] || '',
                        });
                      }}
                    >
                      {ACADEMIC_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>

                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Chapter / Unit
                    <select
                      aria-label="Chapter"
                      className={control}
                      value={draft.chapter || ''}
                      onChange={e => {
                        const nextCh = e.target.value;
                        const topics = getTopicsForChapter(nextCh, draft.subject);
                        update({
                          chapter: nextCh,
                          topic: topics[0] || draft.topic,
                        });
                      }}
                    >
                      <option value="">Select chapter</option>
                      {getChaptersForSubject(draft.subject).map(ch => (
                        <option key={ch.id || ch.name} value={ch.name}>{ch.name}</option>
                      ))}
                    </select>
                  </label>

                  {(() => {
                    const availableTopics = getTopicsForChapter(draft.chapter, draft.subject);
                    const showSelect = !isCustomTopic && availableTopics.length > 0;

                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                            Topic <span className="text-red-500 font-semibold">*</span>
                          </label>
                          {availableTopics.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setIsCustomTopic(!isCustomTopic)}
                              className="text-[11px] font-semibold text-[#f39223] hover:underline cursor-pointer"
                            >
                              {showSelect ? '+ Custom topic' : '← Choose from list'}
                            </button>
                          )}
                        </div>

                        {showSelect ? (
                          <select
                            required
                            aria-label="Topic"
                            className={control}
                            value={draft.topic || ''}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomTopic(true);
                              } else {
                                update({ topic: e.target.value });
                              }
                            }}
                          >
                            <option value="">Select topic</option>
                            {availableTopics.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                            <option value="__custom__">+ Enter custom topic...</option>
                          </select>
                        ) : (
                          <input
                            required
                            aria-label="Custom topic"
                            className={control}
                            value={draft.topic}
                            onChange={(e) => update({ topic: e.target.value })}
                            placeholder="e.g. Electromagnetic waves"
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Marks / Points & Difficulty refinement */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border-color)]">
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Marks / Points <span className="text-red-500 font-semibold">*</span>
                      <input
                        required
                        type="number"
                        min="0.5"
                        step="0.5"
                        className={control}
                        value={draft.marks}
                        onChange={(e) => update({ marks: Number(e.target.value) })}
                      />
                    </label>
                    <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                      Difficulty
                      <select
                        aria-label="Difficulty"
                        className={control}
                        value={draft.difficulty}
                        onChange={(e) => update({ difficulty: e.target.value as PoolQuestion['difficulty'] })}
                      >
                        {['Easy', 'Medium', 'Hard'].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Bloom's Taxonomy
                    <select
                      aria-label="Bloom's Taxonomy"
                      className={control}
                      value={draft.bloomsTaxonomy || 'Apply'}
                      onChange={(e) => update({ bloomsTaxonomy: e.target.value as BloomsTaxonomyLevel })}
                    >
                      {bloomsTaxonomyLevels.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Question Tier / Level Dropdown */}
                  <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                    Question Tier / Level <span className="text-red-500 font-semibold">*</span>
                    <select
                      required
                      aria-label="Question Tier / Level"
                      className={control}
                      value={draft.level || getQuestionLevel(draft)}
                      onChange={(e) => {
                        update({ level: e.target.value as QuestionLevel });
                      }}
                    >
                      {questionLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Tags [tag] Management */}
                  <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold tracking-wide text-[var(--text-primary)]">
                        Question Tags <span className="text-[11px] font-normal text-[var(--text-muted)]">([tag])</span>
                      </label>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {(draft.tags || []).length} tag{(draft.tags || []).length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Active Tags Pills */}
                    {(draft.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                        {(draft.tags || []).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--primary-light)]/40 text-[var(--text-primary)] border border-[var(--primary)]/30 group"
                          >
                            <span className="text-[var(--primary)] font-bold">#</span>
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() =>
                                update({ tags: (draft.tags || []).filter((_, i) => i !== tIdx) })
                              }
                              className="text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer p-0.5 rounded ml-0.5"
                              title={`Remove tag ${tag}`}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Custom Tag Input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
                        <input
                          type="text"
                          placeholder="Add a tag (press Enter)…"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = tagInput.trim().replace(/^#/, '');
                              if (trimmed && !(draft.tags || []).includes(trimmed)) {
                                update({ tags: [...(draft.tags || []), trimmed] });
                                setTagInput('');
                              }
                            }
                          }}
                          className={`${control} pl-8.5`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = tagInput.trim().replace(/^#/, '');
                          if (trimmed && !(draft.tags || []).includes(trimmed)) {
                            update({ tags: [...(draft.tags || []), trimmed] });
                            setTagInput('');
                          }
                        }}
                        disabled={!tagInput.trim()}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2.5 text-xs font-bold transition disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons stuck inside the right sidebar */}
                <div className="pt-4 border-t border-[var(--border-color)] flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="w-1/3 rounded-xl border border-[var(--border-color)] py-2.5 px-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white py-2.5 px-4 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
                  >
                    <Save size={16} />
                    {isEditingExisting ? 'Update Question' : 'Save Question'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </PageWrapper>
  );
}
