import { useState } from 'react';
import { Plus, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { QuestionPoolBrowser } from '../components/QuestionPoolBrowser';
import { questionTypeLabels, bloomsTaxonomyLevels } from '../utils/questionPool';
import type { LiveAssessmentQuestionType, PoolQuestion, BloomsTaxonomyLevel } from '../types';

const control = 'mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 placeholder:text-[var(--text-muted)]';
const lines = (value: string) => value.split('\n').map(line => line.trim()).filter(Boolean);

function newQuestion(type: LiveAssessmentQuestionType = 'mcq'): PoolQuestion {
  return { id: crypto.randomUUID(), type, prompt: '', subject: 'Physics', topic: '', difficulty: 'Medium', bloomsTaxonomy: 'Apply', marks: 2,
    ...(type === 'mcq' ? { options: ['', '', '', ''], correctOptionIndex: 0 } : {}),
    ...(type === 'mmcq' ? { options: ['', '', '', ''], correctOptionIndices: [0], minSelections: 1 } : {}),
    ...(type === 'fill_in_blanks' ? { blankSlots: [{ id: crypto.randomUUID(), label: 'Blank 1', sentencePrefix: '', sentenceSuffix: '', correctAnswer: '' }] } : {}),
    ...(type === 'match_following' ? { matchingPairs: [1, 2].map(() => ({ id: crypto.randomUUID(), leftText: '', rightText: '' })) } : {}),
  };
}

export function QuestionPoolView() {
  const { savePoolQuestion, deletePoolQuestion, addToast, questionPool, setActiveTab } = useExam();
  const [draft, setDraft] = useState<PoolQuestion | null>(null);
  const [deleting, setDeleting] = useState<PoolQuestion | null>(null);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState('');
  const [distractors, setDistractors] = useState('');
  const [wordBank, setWordBank] = useState('');

  const edit = (q: PoolQuestion) => {
    setDraft(structuredClone(q)); setError(''); setSteps(q.orderedSteps?.join('\n') || '');
    setDistractors(q.distractorSteps?.join('\n') || ''); setWordBank(q.blankOptions?.join('\n') || '');
  };

  const update = (value: Partial<PoolQuestion>) => setDraft(prev => prev ? { ...prev, ...value } : prev);

  const save = () => {
    if (!draft) return;
    const q = { ...draft, prompt: draft.prompt.trim(), subject: draft.subject.trim(), topic: draft.topic.trim(), bloomsTaxonomy: draft.bloomsTaxonomy || 'Apply' };
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

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => setActiveTab('online-classes') },
        { label: 'Question Pool', onClick: draft ? () => setDraft(null) : undefined, active: !draft },
        ...(draft ? [{ label: isEditingExisting ? 'Edit Question' : 'Create Question', active: true }] : []),
      ]}
      title={draft ? (isEditingExisting ? 'Edit Question' : 'Create Question') : 'Question Pool'}
      subtitle={draft ? 'Include the answer key so the question is ready for an assessment.' : 'Build once. Reuse in any assessment. Saved in this browser.'}
      onBack={draft ? () => setDraft(null) : undefined}
      actions={!draft ? (
        <button
          type="button"
          onClick={() => edit(newQuestion())}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
        >
          <Plus size={17} />
          Create Question
        </button>
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
        <form onSubmit={e => { e.preventDefault(); save(); }} className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
            {/* Form Section Header with Accent Bar */}
            <div className="flex items-center gap-2">
              <span className="h-px w-4 bg-[var(--primary)]" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                Question Details & Academic Mapping
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                Question type
                <select
                  aria-label="Question type"
                  className={control}
                  value={draft.type}
                  onChange={e => {
                    const next = newQuestion(e.target.value as LiveAssessmentQuestionType);
                    edit({ ...next, id: draft.id, prompt: draft.prompt, subject: draft.subject, topic: draft.topic, difficulty: draft.difficulty, bloomsTaxonomy: draft.bloomsTaxonomy, marks: draft.marks, explanation: draft.explanation });
                  }}
                >
                  {Object.entries(questionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                Subject <span className="text-red-500 font-semibold">*</span>
                <input required className={control} value={draft.subject} onChange={e => update({ subject: e.target.value })} placeholder="e.g. Physics" />
              </label>

              <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)] sm:col-span-2">
                Topic <span className="text-red-500 font-semibold">*</span>
                <input required className={control} value={draft.topic} onChange={e => update({ topic: e.target.value })} placeholder="e.g. Electromagnetic waves" />
              </label>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Difficulty
                  <select aria-label="Difficulty" className={control} value={draft.difficulty} onChange={e => update({ difficulty: e.target.value as PoolQuestion['difficulty'] })}>
                    {['Easy', 'Medium', 'Hard'].map(value => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Bloom's Taxonomy
                  <select aria-label="Bloom's Taxonomy" className={control} value={draft.bloomsTaxonomy || 'Apply'} onChange={e => update({ bloomsTaxonomy: e.target.value as BloomsTaxonomyLevel })}>
                    {bloomsTaxonomyLevels.map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Marks <span className="text-red-500 font-semibold">*</span>
                  <input required type="number" min="0.5" step="0.5" className={control} value={draft.marks} onChange={e => update({ marks: Number(e.target.value) })} />
                </label>
              </div>
            </div>

            {/* Form Section Header with Accent Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
              <span className="h-px w-4 bg-[var(--primary)]" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                Question Prompt & Answers
              </h2>
            </div>

            <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
              Question <span className="text-red-500 font-semibold">*</span>
              <textarea aria-label="Question" required rows={3} className={control} value={draft.prompt} onChange={e => update({ prompt: e.target.value })} placeholder="Enter your question…" />
            </label>

            {(draft.type === 'mcq' || draft.type === 'mmcq') && (
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Answer options</p>
                <p className="text-xs text-[var(--text-muted)]">{draft.type === 'mcq' ? 'Select the one correct answer.' : 'Check all correct answers.'}</p>
                {draft.options?.map((option, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      aria-label={`Correct answer ${i + 1}`}
                      type={draft.type === 'mcq' ? 'radio' : 'checkbox'}
                      name="correct-answer"
                      checked={draft.type === 'mcq' ? draft.correctOptionIndex === i : draft.correctOptionIndices?.includes(i) || false}
                      onChange={e => update(draft.type === 'mcq' ? { correctOptionIndex: i } : { correctOptionIndices: e.target.checked ? [...(draft.correctOptionIndices || []), i] : draft.correctOptionIndices?.filter(index => index !== i) })}
                      className="accent-orange-500 h-4 w-4 cursor-pointer"
                    />
                    <input
                      required
                      aria-label={`Option ${i + 1}`}
                      className={control}
                      value={option}
                      onChange={e => update({ options: draft.options?.map((value, index) => index === i ? e.target.value : value) })}
                    />
                    <button
                      type="button"
                      aria-label={`Remove option ${i + 1}`}
                      disabled={(draft.options?.length || 0) <= 2}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--status-error-icon)] disabled:opacity-30 cursor-pointer"
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
                <button
                  type="button"
                  onClick={() => update({ options: [...(draft.options || []), ''] })}
                  className="text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  + Add option
                </button>
              </div>
            )}

            {draft.type === 'fill_in_blanks' && (
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Sentence blanks</p>
                {draft.blankSlots?.map((slot, i) => (
                  <div key={slot.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] p-3 space-y-2">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Blank {i + 1}</p>
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
                    <button
                      type="button"
                      disabled={draft.blankSlots!.length <= 1}
                      onClick={() => update({ blankSlots: draft.blankSlots?.filter(s => s.id !== slot.id) })}
                      className="text-xs text-[var(--status-error-icon)] disabled:opacity-30 cursor-pointer"
                    >
                      Remove blank
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                  onClick={() => update({ blankSlots: [...(draft.blankSlots || []), { id: crypto.randomUUID(), label: `Blank ${(draft.blankSlots?.length || 0) + 1}`, sentencePrefix: '', sentenceSuffix: '', correctAnswer: '' }] })}
                >
                  + Add blank
                </button>
                <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Word bank (optional, one option per line)
                  <textarea className={control} rows={3} value={wordBank} onChange={e => setWordBank(e.target.value)} />
                </label>
              </div>
            )}

            {draft.type === 'match_following' && (
              <div className="space-y-3">
                <p className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">Correct matching pairs</p>
                {draft.matchingPairs?.map((pair, i) => (
                  <div key={pair.id} className="flex items-center gap-2">
                    <input required aria-label={`Pair ${i + 1} left`} placeholder="Column A" className={control} value={pair.leftText} onChange={e => update({ matchingPairs: draft.matchingPairs?.map(p => p.id === pair.id ? { ...p, leftText: e.target.value } : p) })} />
                    <span className="text-[var(--text-muted)]">→</span>
                    <input required aria-label={`Pair ${i + 1} right`} placeholder="Column B" className={control} value={pair.rightText} onChange={e => update({ matchingPairs: draft.matchingPairs?.map(p => p.id === pair.id ? { ...p, rightText: e.target.value } : p) })} />
                    <button type="button" aria-label={`Remove pair ${i + 1}`} disabled={draft.matchingPairs!.length <= 2} className="text-[var(--text-secondary)] hover:text-[var(--status-error-icon)] disabled:opacity-30 cursor-pointer" onClick={() => update({ matchingPairs: draft.matchingPairs?.filter(p => p.id !== pair.id) })}><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" className="text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer" onClick={() => update({ matchingPairs: [...(draft.matchingPairs || []), { id: crypto.randomUUID(), leftText: '', rightText: '' }] })}>+ Add pair</button>
              </div>
            )}

            {draft.type === 'step_ordering' && (
              <>
                <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Steps in correct order (one per line)
                  <textarea required rows={5} className={control} value={steps} onChange={e => setSteps(e.target.value)} />
                </label>
                <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                  Distractors (optional, one per line)
                  <textarea rows={3} className={control} value={distractors} onChange={e => setDistractors(e.target.value)} />
                </label>
              </>
            )}

            <label className="block text-xs font-medium tracking-wide text-[var(--text-secondary)]">
              Explanation (optional)
              <textarea rows={3} className={control} value={draft.explanation || ''} onChange={e => update({ explanation: e.target.value })} />
            </label>
          </div>

          {error && <p role="alert" className="rounded-xl bg-[var(--status-error-bg)] border border-[var(--status-error-border)] p-3 text-sm text-[var(--status-error-text)]">{error}</p>}

          <div className="sticky bottom-0 flex justify-end gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 text-sm font-semibold shadow-sm cursor-pointer"
            >
              <Save size={16} />
              Save question
            </button>
          </div>
        </form>
      )}
    </PageWrapper>
  );
}
