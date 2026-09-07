import { useState } from 'react';
import { questionTypeLabels, bloomsTaxonomyLevels, bloomsTaxonomyColors } from '../utils/questionPool';
import { Library, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import type { PoolQuestion } from '../types';

const control = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export function QuestionPoolBrowser({ onAdd, usedIds = [], destination, onEdit, onDelete }: {
  onAdd?: (questions: PoolQuestion[]) => void;
  usedIds?: string[];
  destination?: string;
  onEdit?: (question: PoolQuestion) => void;
  onDelete?: (question: PoolQuestion) => void;
}) {
  const { questionPool } = useExam();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [bloom, setBloom] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = questionPool
    .filter(q => q.type !== 'short_answer')
    .filter(q => (!subject || q.subject === subject)
      && (!type || q.type === type)
      && (!difficulty || q.difficulty === difficulty)
      && (!bloom || q.bloomsTaxonomy === bloom)
      && `${q.prompt} ${q.subject} ${q.topic} ${q.bloomsTaxonomy || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const selectedQuestions = questionPool.filter(q => selected.includes(q.id) && !usedIds.includes(q.id));
  return <section aria-label="Question pool browser" className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3"><Library className="text-blue-600 mt-1" size={22} /><div><h2 className="font-bold text-slate-900">{onAdd ? 'Add from question pool' : 'All questions'}</h2><p className="text-sm text-slate-500 mt-1">{onAdd ? `Search and select questions for ${destination}.` : 'Keep your questions ready to reuse across assessments.'}</p></div></div>
      <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">{questionPool.filter(q => q.type !== 'short_answer').length} in pool</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
      <div className="relative"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search question pool" placeholder="Search questions, subjects or topics…" value={search} onChange={e => setSearch(e.target.value)} className={`${control} pl-9`} /></div>
      <select aria-label="Filter by subject" value={subject} onChange={e => setSubject(e.target.value)} className={control}><option value="">All subjects</option>{[...new Set(questionPool.map(q => q.subject))].sort().map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by question type" value={type} onChange={e => setType(e.target.value)} className={control}><option value="">All question types</option>{Object.entries(questionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Filter by difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className={control}><option value="">All difficulties</option>{['Easy', 'Medium', 'Hard'].map(value => <option key={value}>{value}</option>)}</select>
      <select aria-label="Filter by Bloom's Taxonomy" value={bloom} onChange={e => setBloom(e.target.value)} className={control}><option value="">All Bloom levels</option>{bloomsTaxonomyLevels.map(value => <option key={value} value={value}>{value}</option>)}</select>
    </div>
    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span role="status">{filtered.length} matching question{filtered.length === 1 ? '' : 's'}</span>{(search || subject || type || difficulty || bloom) && <button className="text-blue-600 font-semibold" onClick={() => { setSearch(''); setSubject(''); setType(''); setDifficulty(''); setBloom(''); }}>Clear filters</button>}</div>
    <div className="space-y-3 max-h-[540px] overflow-y-auto">
      {!filtered.length && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center"><Library className="mx-auto mb-3 text-slate-400" /><p className="font-semibold text-slate-800">{questionPool.length ? 'No matching questions' : 'Your question pool is empty'}</p><p className="mt-2 text-sm text-slate-500">{questionPool.length ? 'Try another search or clear your filters.' : 'Create a question in Question Pool to get started.'}</p></div>}
      {filtered.map(q => {
        const added = usedIds.includes(q.id);
        const bloomColor = q.bloomsTaxonomy ? bloomsTaxonomyColors[q.bloomsTaxonomy] : null;
        return <article key={q.id} className={`rounded-xl border p-4 ${selected.includes(q.id) && !added ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200'}`}>
          <div className="flex items-start gap-3">
            {onAdd && <input type="checkbox" aria-label={`Select question: ${q.prompt}`} disabled={added} checked={added || selected.includes(q.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, q.id] : prev.filter(id => id !== q.id))} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" />}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-1 text-slate-700 font-medium">{questionTypeLabels[q.type as keyof typeof questionTypeLabels] || q.type}</span>
                {q.bloomsTaxonomy && (
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${bloomColor?.bg || 'bg-blue-50'} ${bloomColor?.text || 'text-blue-700'} ${bloomColor?.border || 'border-blue-200'}`}>
                    Bloom: {q.bloomsTaxonomy}
                  </span>
                )}
                <span>{q.subject}</span>
                <span>· {q.difficulty}</span>
                <span>· {q.marks} marks</span>
                {added && <span className="text-emerald-700 font-semibold">Added to assessment</span>}
              </div>
              <p className="mt-2 text-sm font-semibold whitespace-pre-wrap break-words text-slate-900">{q.prompt}</p>
              <p className="mt-1 text-xs text-slate-500">{q.topic}</p>
              <details className="mt-3 text-sm"><summary className="cursor-pointer text-blue-600 font-medium">View answer & details</summary><div className="mt-2 rounded-lg bg-slate-50 p-3 space-y-2 text-slate-700">
                {q.options?.map((option, i) => <p key={i}>{option}{(q.type === 'mcq' ? q.correctOptionIndex === i : q.correctOptionIndices?.includes(i)) && <span className="text-emerald-700 font-semibold"> ✓ Correct</span>}</p>)}
                {q.blankSlots?.map(slot => <p key={slot.id}>{slot.sentencePrefix} <strong>{slot.correctAnswer}</strong> {slot.sentenceSuffix}</p>)}
                {q.matchingPairs?.map(pair => <p key={pair.id}>{pair.leftText} → {pair.rightText}</p>)}
                {q.orderedSteps?.map((step, i) => <p key={i}>{i + 1}. {step}</p>)}
                {q.distractorSteps?.length ? <p>Distractors: {q.distractorSteps.join('; ')}</p> : null}
                {q.explanation && <p className="pt-2 border-t border-slate-200">{q.explanation}</p>}
              </div></details>
            </div>
            {onEdit && <button aria-label={`Edit question: ${q.prompt}`} onClick={() => onEdit(q)} className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"><Pencil size={16} /></button>}
            {onDelete && <button aria-label={`Delete question: ${q.prompt}`} onClick={() => onDelete(q)} className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
          </div>
        </article>;
      })}
    </div>
    {onAdd && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"><span className="text-sm text-slate-600">{selectedQuestions.length} selected · {selectedQuestions.reduce((sum, q) => sum + q.marks, 0)} marks</span><div className="flex gap-3"><button disabled={!selectedQuestions.length} onClick={() => setSelected([])} className="text-sm text-slate-600 disabled:opacity-40">Clear selection</button><button disabled={!selectedQuestions.length} onClick={() => { onAdd(selectedQuestions); setSelected([]); }} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700"><Plus size={16} />Add selected questions</button></div></div>}
  </section>;
}
