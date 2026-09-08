import { useState } from 'react';
import {
  questionTypeLabels,
  bloomsTaxonomyLevels,
  bloomsTaxonomyColors,
  questionLevels,
  questionLevelConfig,
  getQuestionLevel,
} from '../utils/questionPool';
import { Library, Search, Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { AcademicTaxonomyBar, type AcademicTaxonomyValues } from './common/AcademicTaxonomyBar';
import type { PoolQuestion } from '../types';

const control = 'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';

export function QuestionPoolBrowser({
  onAdd,
  usedIds = [],
  destination,
  onEdit,
  onDelete,
  initialTaxonomy,
}: {
  onAdd?: (questions: PoolQuestion[]) => void;
  usedIds?: string[];
  destination?: string;
  onEdit?: (question: PoolQuestion) => void;
  onDelete?: (question: PoolQuestion) => void;
  initialTaxonomy?: Partial<AcademicTaxonomyValues>;
}) {
  const { questionPool } = useExam();
  const [taxonomy, setTaxonomy] = useState<AcademicTaxonomyValues>({
    board: initialTaxonomy?.board || 'CBSE',
    classGrade: initialTaxonomy?.classGrade || '',
    subject: initialTaxonomy?.subject || '',
    chapter: initialTaxonomy?.chapter || '',
    topic: initialTaxonomy?.topic || '',
  });

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [bloom, setBloom] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = questionPool
    .filter(q => q.type !== 'short_answer')
    .filter(q => {
      // Academic taxonomy filters
      const matchBoard = !taxonomy.board || !q.board || q.board.toLowerCase() === taxonomy.board.toLowerCase();
      const matchClass = !taxonomy.classGrade || (q.classGrade && q.classGrade.toLowerCase().includes(taxonomy.classGrade.toLowerCase()));
      const matchSubject = !taxonomy.subject || q.subject.toLowerCase() === taxonomy.subject.toLowerCase();
      const matchChapter = !taxonomy.chapter || (q.chapter && q.chapter.toLowerCase().includes(taxonomy.chapter.toLowerCase()));
      const matchTopic = !taxonomy.topic || q.topic.toLowerCase().includes(taxonomy.topic.toLowerCase());

      // Secondary filters
      const qLevel = getQuestionLevel(q);
      const matchLevel = !level || qLevel === level;
      const matchType = !type || q.type === type;
      const matchDifficulty = !difficulty || q.difficulty === difficulty;
      const matchBloom = !bloom || q.bloomsTaxonomy === bloom;

      // Text query
      const tagText = (q.tags || []).join(' ');
      const fullText = `${q.prompt} ${q.subject} ${q.topic} ${q.chapter || ''} ${q.classGrade || ''} ${q.board || ''} ${q.bloomsTaxonomy || ''} ${qLevel} ${tagText}`.toLowerCase();
      const matchSearch = !search.trim() || fullText.includes(search.trim().toLowerCase());

      return (
        matchBoard &&
        matchClass &&
        matchSubject &&
        matchChapter &&
        matchTopic &&
        matchLevel &&
        matchType &&
        matchDifficulty &&
        matchBloom &&
        matchSearch
      );
    });

  const selectedQuestions = questionPool.filter(q => selected.includes(q.id) && !usedIds.includes(q.id));

  const hasAnyFilter = Boolean(
    taxonomy.classGrade ||
    taxonomy.subject ||
    taxonomy.chapter ||
    taxonomy.topic ||
    taxonomy.board !== 'CBSE' ||
    search ||
    level ||
    type ||
    difficulty ||
    bloom
  );

  const clearAllFilters = () => {
    setTaxonomy({
      board: 'CBSE',
      classGrade: '',
      subject: '',
      chapter: '',
      topic: '',
    });
    setSearch('');
    setLevel('');
    setType('');
    setDifficulty('');
    setBloom('');
  };

  return (
    <section aria-label="Question pool browser" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Library className="text-[var(--primary)] mt-1" size={22} />
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">{onAdd ? 'Add from question pool' : 'All questions'}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{onAdd ? `Search and select questions for ${destination}.` : 'Keep your questions ready to reuse across assessments.'}</p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--primary-light)] text-[var(--primary-hover)] border border-[var(--primary)] px-3 py-1 text-xs font-semibold">
          {questionPool.filter(q => q.type !== 'short_answer').length} in pool
        </span>
      </div>

      {/* 5-Dropdown Academic Taxonomy Header Bar (CBSE | Select class | Select subject | Select chapter | Select topic) */}
      <div className="rounded-xl border border-slate-200/80 dark:border-[var(--border-color)] bg-[var(--bg-main)] p-2.5 sm:p-3 space-y-2">
        <AcademicTaxonomyBar
          values={taxonomy}
          onChange={setTaxonomy}
        />
      </div>

      {/* Secondary Search & Pedagogical Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.1fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            aria-label="Search question pool"
            placeholder="Search prompt keywords, questions, or tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${control} pl-9`}
          />
        </div>
        <select aria-label="Filter by level" value={level} onChange={e => setLevel(e.target.value)} className={control}>
          <option value="">All levels</option>
          {questionLevels.map(lvl => (
            <option key={lvl} value={lvl}>{lvl} ({questionLevelConfig[lvl].defaultPoints} pt{questionLevelConfig[lvl].defaultPoints > 1 ? 's' : ''})</option>
          ))}
        </select>
        <select aria-label="Filter by question type" value={type} onChange={e => setType(e.target.value)} className={control}>
          <option value="">All question types</option>
          {Object.entries(questionTypeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select aria-label="Filter by difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className={control}>
          <option value="">All difficulties</option>
          {['Easy', 'Medium', 'Hard'].map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
        <select aria-label="Filter by Bloom's Taxonomy" value={bloom} onChange={e => setBloom(e.target.value)} className={control}>
          <option value="">All Bloom levels</option>
          {bloomsTaxonomyLevels.map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* Filter status & clear action */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <span role="status">
          {filtered.length} matching question{filtered.length === 1 ? '' : 's'}
          {taxonomy.subject ? ` in ${taxonomy.subject}` : ''}
          {taxonomy.chapter ? ` · ${taxonomy.chapter}` : ''}
          {level ? ` · ${level}` : ''}
        </span>
        {hasAnyFilter && (
          <button
            type="button"
            className="text-[var(--primary)] font-semibold hover:underline cursor-pointer"
            onClick={clearAllFilters}
          >
            Clear all filters
          </button>
        )}
      </div>
    <div className="space-y-3 max-h-[540px] overflow-y-auto">
      {!filtered.length && <div className="rounded-xl border border-dashed border-[var(--border-color)] p-10 text-center"><Library className="mx-auto mb-3 text-[var(--text-muted)]" /><p className="font-semibold text-[var(--text-primary)]">{questionPool.length ? 'No matching questions' : 'Your question pool is empty'}</p><p className="mt-2 text-sm text-[var(--text-secondary)]">{questionPool.length ? 'Try another search or clear your filters.' : 'Create a question in Question Pool to get started.'}</p></div>}
      {filtered.map(q => {
        const added = usedIds.includes(q.id);
        const bloomColor = q.bloomsTaxonomy ? bloomsTaxonomyColors[q.bloomsTaxonomy] : null;
        const qLvl = getQuestionLevel(q);
        const lvlMeta = questionLevelConfig[qLvl];
        return <article key={q.id} className={`rounded-xl border p-4 transition-colors ${selected.includes(q.id) && !added ? 'border-[var(--primary)] bg-[var(--primary-light)]/20' : 'border-[var(--border-color)] bg-[var(--bg-card)]'}`}>
          <div className="flex items-start gap-3">
            {onAdd && <input type="checkbox" aria-label={`Select question: ${q.prompt}`} disabled={added} checked={added || selected.includes(q.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} className="mt-1 h-4 w-4 shrink-0 accent-orange-500 cursor-pointer" />}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                {/* Level 1, 2, 3 [tag] - point badge */}
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-black border ${lvlMeta.badgeClass} flex items-center gap-1 shadow-2xs`}
                  title={`${lvlMeta.description} · Default ${lvlMeta.defaultPoints} pt`}
                >
                  <span>{qLvl}</span>
                  <span className="opacity-60 font-semibold">·</span>
                  <span>{q.marks || lvlMeta.defaultPoints} pt{(q.marks || lvlMeta.defaultPoints) === 1 ? '' : 's'}</span>
                </span>

                <span className="rounded bg-[var(--bg-main)] px-2 py-0.5 text-[var(--text-primary)] font-medium border border-[var(--border-color)]">
                  {questionTypeLabels[q.type as keyof typeof questionTypeLabels] || q.type}
                </span>
                {q.board && (
                  <span className="rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-bold">
                    {q.board}
                  </span>
                )}
                {q.classGrade && (
                  <span className="rounded bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-[11px] font-semibold">
                    {q.classGrade}
                  </span>
                )}
                {q.bloomsTaxonomy && (
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${bloomColor?.bg || 'bg-[var(--primary-light)]'} ${bloomColor?.text || 'text-[var(--primary-hover)]'} ${bloomColor?.border || 'border-[var(--primary)]'}`}>
                    Bloom: {q.bloomsTaxonomy}
                  </span>
                )}
                <span>{q.subject}</span>
                {q.chapter && <span>· {q.chapter}</span>}
                <span>· {q.difficulty}</span>
                {added && <span className="text-[var(--status-success-text)] font-semibold">Added to assessment</span>}
              </div>
              <p className="mt-2 text-sm font-semibold whitespace-pre-wrap break-words text-[var(--text-primary)]">{q.prompt}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {q.topic ? <span className="text-xs text-[var(--text-secondary)]">Topic: {q.topic}</span> : null}
                {q.tags && q.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {q.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <details className="mt-3 text-sm"><summary className="cursor-pointer text-[var(--primary)] font-medium">View answer & details</summary><div className="mt-2 rounded-lg bg-[var(--bg-main)] p-3 space-y-2 text-[var(--text-primary)] border border-[var(--border-color)]">
                {q.options?.map((option, i) => <p key={i}>{option}{(q.type === 'mcq' ? q.correctOptionIndex === i : q.correctOptionIndices?.includes(i)) && <span className="text-[var(--status-success-text)] font-semibold"> ✓ Correct</span>}</p>)}
                {q.blankSlots?.map(slot => <p key={slot.id}>{slot.sentencePrefix} <strong>{slot.correctAnswer}</strong> {slot.sentenceSuffix}</p>)}
                {q.matchingPairs?.map(pair => <p key={pair.id}>{pair.leftText} → {pair.rightText}</p>)}
                {q.orderedSteps?.map((step, i) => <p key={i}>{i + 1}. {step}</p>)}
                {q.distractorSteps?.length ? <p>Distractors: {q.distractorSteps.join('; ')}</p> : null}
                {q.explanation && <p className="pt-2 border-t border-[var(--border-color)]">{q.explanation}</p>}
              </div></details>
            </div>
            {onEdit && <button aria-label={`Edit question: ${q.prompt}`} onClick={() => onEdit(q)} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors cursor-pointer"><Pencil size={16} /></button>}
            {onDelete && <button aria-label={`Delete question: ${q.prompt}`} onClick={() => onDelete(q)} className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:text-[var(--status-error-icon)] hover:bg-[var(--status-error-bg)] transition-colors cursor-pointer"><Trash2 size={16} /></button>}
          </div>
        </article>;
      })}
    </div>
    {onAdd && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-color)] pt-4"><span className="text-sm text-[var(--text-secondary)]">{selectedQuestions.length} selected · {selectedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks</span><div className="flex gap-3"><button disabled={!selectedQuestions.length} onClick={() => setSelected([])} className="text-sm text-[var(--text-secondary)] disabled:opacity-40 cursor-pointer">Clear selection</button><button disabled={!selectedQuestions.length} onClick={() => { onAdd(selectedQuestions); setSelected([]); }} className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-40 cursor-pointer"><Plus size={16} />Add selected questions</button></div></div>}
    </section>
  );
}
