import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  Check,
  ChevronDown,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Layers,
  Edit3,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import {
  ACADEMIC_BOARDS,
  ACADEMIC_CLASSES,
  ACADEMIC_SUBJECTS,
  CURRICULUM_CHAPTERS,
} from '../data/curriculumData';
import type { PoolQuestion, BloomsTaxonomyLevel, QuestionLevel } from '../types';

export interface AIQuestionGeneratorProps {
  onClose: () => void;
}

interface CriteriaRow {
  id: string;
  count: number;
  marks: number;
  difficultyLevels: ('Easy' | 'Medium' | 'Hard')[];
  bloomTaxonomies: ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[];
}

const ALL_QUESTION_TYPES = [
  'Multiple Choice Question',
  'Multi-Multiple Choice Question',
  'True/False',
  'Match the Following',
  'Sequence Ordering',
] as const;

type QuestionTypeName = (typeof ALL_QUESTION_TYPES)[number];

const DIFFICULTY_LEVELS: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

const BLOOM_TAXONOMIES: ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

// Presets for Quick Generate dropdown
const QUICK_PRESETS = [
  {
    title: 'Standard Unit Test',
    desc: '4 Questions • 6 Marks',
    types: ['Multiple Choice Question', 'Multi-Multiple Choice Question'] as QuestionTypeName[],
    configs: {
      'Multiple Choice Question': [
        { id: '1', count: 2, marks: 1, difficultyLevels: ['Easy', 'Medium'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Remember', 'Understand'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
      'Multi-Multiple Choice Question': [
        { id: '2', count: 2, marks: 2, difficultyLevels: ['Medium', 'Hard'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Apply', 'Analyze'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
    },
  },
  {
    title: 'Concept & Matching Test',
    desc: '4 Questions • 8 Marks',
    types: ['Multiple Choice Question', 'Match the Following', 'Sequence Ordering'] as QuestionTypeName[],
    configs: {
      'Multiple Choice Question': [
        { id: '1', count: 2, marks: 1, difficultyLevels: ['Easy'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Remember'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
      'Match the Following': [
        { id: '2', count: 1, marks: 4, difficultyLevels: ['Medium'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Understand', 'Apply'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
      'Sequence Ordering': [
        { id: '3', count: 1, marks: 2, difficultyLevels: ['Hard'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Analyze', 'Evaluate'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
    },
  },
  {
    title: 'Quick Pop Quiz',
    desc: '3 Questions • 3 Marks',
    types: ['Multiple Choice Question', 'True/False'] as QuestionTypeName[],
    configs: {
      'Multiple Choice Question': [
        { id: '1', count: 2, marks: 1, difficultyLevels: ['Easy'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Remember', 'Understand'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
      'True/False': [
        { id: '2', count: 1, marks: 1, difficultyLevels: ['Easy'] as ('Easy' | 'Medium' | 'Hard')[], bloomTaxonomies: ['Remember'] as ('Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create')[] },
      ],
    },
  },
];

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({ onClose }) => {
  const { savePoolQuestions, addToast } = useExam();

  // Generator form state
  const [syllabus, setSyllabus] = useState('CBSE');
  const [classGrade, setClassGrade] = useState('Class 10');
  const [subject, setSubject] = useState('Physics');
  const [chapter, setChapter] = useState('Electricity & Electromagnetic Induction');
  const [customChapter, setCustomChapter] = useState('');
  const [generateFromAttachment, setGenerateFromAttachment] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [showQuickPresets, setShowQuickPresets] = useState(false);

  // Selected Question Types
  const [enabledTypes, setEnabledTypes] = useState<QuestionTypeName[]>([
    'Multiple Choice Question',
    'Multi-Multiple Choice Question',
  ]);

  // Configurations for each type
  const [typeConfigs, setTypeConfigs] = useState<Record<string, CriteriaRow[]>>({
    'Multiple Choice Question': [
      {
        id: 'mcq-1',
        count: 1,
        marks: 1,
        difficultyLevels: ['Easy'],
        bloomTaxonomies: ['Remember'],
      },
    ],
    'Multi-Multiple Choice Question': [
      {
        id: 'mmcq-1',
        count: 1,
        marks: 1,
        difficultyLevels: ['Medium'],
        bloomTaxonomies: ['Apply'],
      },
    ],
  });

  // Flow states
  const [step, setStep] = useState<'form' | 'generating' | 'preview'>('form');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStatus, setGeneratingStatus] = useState('');

  // Generated Questions in Preview
  const [generatedQuestions, setGeneratedQuestions] = useState<PoolQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available chapters for the selected subject
  const availableChapters = (CURRICULUM_CHAPTERS[subject] || []).map((ch) => ch.name);

  // Toggle question type selection
  const toggleQuestionType = (typeName: QuestionTypeName) => {
    if (enabledTypes.includes(typeName)) {
      setEnabledTypes(enabledTypes.filter((t) => t !== typeName));
    } else {
      setEnabledTypes([...enabledTypes, typeName]);
      if (!typeConfigs[typeName] || typeConfigs[typeName].length === 0) {
        setTypeConfigs((prev) => ({
          ...prev,
          [typeName]: [
            {
              id: `${typeName}-1`,
              count: 1,
              marks: typeName === 'Match the Following' ? 4 : typeName === 'Sequence Ordering' ? 3 : typeName.includes('Multi') ? 2 : 1,
              difficultyLevels: ['Easy'],
              bloomTaxonomies: ['Understand'],
            },
          ],
        }));
      }
    }
  };

  // Add row to a question type
  const addRow = (typeName: QuestionTypeName) => {
    const currentRows = typeConfigs[typeName] || [];
    const newRow: CriteriaRow = {
      id: `${typeName}-${Date.now()}`,
      count: 1,
      marks: 1,
      difficultyLevels: ['Medium'],
      bloomTaxonomies: ['Apply'],
    };
    setTypeConfigs((prev) => ({
      ...prev,
      [typeName]: [...currentRows, newRow],
    }));
  };

  // Remove row
  const removeRow = (typeName: QuestionTypeName, rowId: string) => {
    const currentRows = typeConfigs[typeName] || [];
    if (currentRows.length <= 1) {
      // If only 1 row, remove the type from enabled types
      setEnabledTypes(enabledTypes.filter((t) => t !== typeName));
    } else {
      setTypeConfigs((prev) => ({
        ...prev,
        [typeName]: currentRows.filter((r) => r.id !== rowId),
      }));
    }
  };

  // Update row values
  const updateRow = (typeName: QuestionTypeName, rowId: string, updates: Partial<CriteriaRow>) => {
    setTypeConfigs((prev) => ({
      ...prev,
      [typeName]: (prev[typeName] || []).map((row) =>
        row.id === rowId ? { ...row, ...updates } : row
      ),
    }));
  };

  // File handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKb = (file.size / 1024).toFixed(1);
      setUploadedFile({
        name: file.name,
        size: `${sizeKb} KB`,
      });
      addToast('File uploaded', `${file.name} is attached for AI question extraction.`, 'success');
    }
  };

  // Apply quick preset
  const applyPreset = (preset: (typeof QUICK_PRESETS)[number]) => {
    setEnabledTypes(preset.types);
    setTypeConfigs(preset.configs as any);
    setShowQuickPresets(false);
    addToast('Preset Applied', `Loaded "${preset.title}" configuration.`, 'success');
  };

  // Send to AI and Generate
  const handleSendToAI = () => {
    if (enabledTypes.length === 0) {
      addToast('Select Question Types', 'Please select at least one question type to generate.', 'warning');
      return;
    }

    setStep('generating');
    setGeneratingProgress(15);
    setGeneratingStatus('Connecting to Gemini AI curriculum pipeline...');

    const activeChapter = customChapter.trim() || chapter || 'Key Concepts & Applications';

    setTimeout(() => {
      setGeneratingProgress(45);
      setGeneratingStatus(`Extracting ${subject} syllabus parameters for ${classGrade}...`);
    }, 450);

    setTimeout(() => {
      setGeneratingProgress(75);
      setGeneratingStatus('Drafting questions, option distractors & Bloom taxonomy...');
    }, 900);

    setTimeout(() => {
      setGeneratingProgress(100);
      setGeneratingStatus('Synthesizing pedagogical rationales and answer keys...');

      // Generate realistic questions based on requested criteria
      const generated = generateMockAIQuestions({
        syllabus,
        classGrade,
        subject,
        chapter: activeChapter,
        uploadedFile: generateFromAttachment ? uploadedFile : null,
        enabledTypes,
        typeConfigs,
      });

      setGeneratedQuestions(generated);
      setSelectedQuestionIds(new Set(generated.map((q) => q.id)));
      setStep('preview');
    }, 1350);
  };

  // Toggle selection for moving to pool
  const toggleSelectQuestion = (id: string) => {
    const next = new Set(selectedQuestionIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedQuestionIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedQuestionIds.size === generatedQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(generatedQuestions.map((q) => q.id)));
    }
  };

  const removeGeneratedQuestion = (id: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id));
    const next = new Set(selectedQuestionIds);
    next.delete(id);
    setSelectedQuestionIds(next);
  };

  const updateGeneratedQuestionPrompt = (id: string, newPrompt: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, prompt: newPrompt } : q))
    );
  };

  // Move selected questions to Question Pool
  const handleMoveToPool = () => {
    const toMove = generatedQuestions.filter((q) => selectedQuestionIds.has(q.id));
    if (toMove.length === 0) {
      addToast('No Questions Selected', 'Please select at least one question to move to the pool.', 'warning');
      return;
    }

    savePoolQuestions(toMove);
    addToast(
      'Questions Added to Pool',
      `${toMove.length} AI-generated question${toMove.length > 1 ? 's were' : ' was'} successfully added to your Question Pool.`,
      'success'
    );
    onClose();
  };

  // Total marks tally
  const totalQuestionsCount = generatedQuestions.length;
  const totalMarks = generatedQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar when in preview mode */}
      {step === 'preview' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-300">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Generated Questions Preview
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Review and refine questions below before importing to your pool.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <Sliders size={14} />
              Reconfigure
            </button>
            <button
              type="button"
              onClick={handleSendToAI}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800 text-xs font-bold hover:bg-orange-100 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleMoveToPool}
              disabled={selectedQuestionIds.size === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f39223] hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              Move to Pool ({selectedQuestionIds.size})
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: FORM / GENERATOR CONFIG */}
      {step === 'form' && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-6 shadow-sm">
          {/* 1. Header Filters: Syllabus, Class, Subject, Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Syllabus
              </label>
              <select
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {ACADEMIC_BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Class
              </label>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Select Class</option>
                {ACADEMIC_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => {
                  const nextSub = e.target.value;
                  setSubject(nextSub);
                  const firstCh = CURRICULUM_CHAPTERS[nextSub]?.[0]?.name || '';
                  setChapter(firstCh);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Select Subject</option>
                {ACADEMIC_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                Chapter
              </label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-primary)] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="">Select Chapter</option>
                {availableChapters.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
                <option value="__custom__">+ Custom Chapter / Topic</option>
              </select>
            </div>
          </div>

          {chapter === '__custom__' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Enter Custom Chapter or Topic Name
              </label>
              <input
                type="text"
                value={customChapter}
                onChange={(e) => setCustomChapter(e.target.value)}
                placeholder="e.g. Electromagnetic Induction & Lenz's Law"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-sm text-[var(--text-primary)] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          )}

          {/* 2. Generate from Attachment & Quick Generate Row */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={generateFromAttachment}
                  onChange={(e) => setGenerateFromAttachment(e.target.checked)}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-4 h-4"
                />
                <span>Generate data from the attachment</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQuickPresets(!showQuickPresets)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Quick Generate <ChevronDown size={14} />
                </button>

                {showQuickPresets && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl p-2 z-20 space-y-1">
                    <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
                      Quick Presets
                    </p>
                    {QUICK_PRESETS.map((p) => (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-main)] transition text-xs font-semibold text-[var(--text-primary)] flex flex-col cursor-pointer"
                      >
                        <span>{p.title}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload file drag-and-drop area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const sizeKb = (file.size / 1024).toFixed(1);
                  setUploadedFile({ name: file.name, size: `${sizeKb} KB` });
                  addToast('File dropped', `${file.name} uploaded.`, 'success');
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                uploadedFile
                  ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20'
                  : 'border-[var(--border-color)] bg-[var(--bg-main)] hover:border-orange-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{uploadedFile.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{uploadedFile.size} • Ready for AI question synthesis</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-muted)] hover:text-red-500 transition cursor-pointer ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                    <span>Drag and drop your file here, or</span>
                    <span className="text-[#f39223] font-bold underline inline-flex items-center gap-0.5">
                      click to select <Upload size={12} />
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    (Supported formats: PDF, DOC, DOCX, TXT)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Question Types Checkboxes */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Question Types
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
              {ALL_QUESTION_TYPES.map((type) => {
                const isChecked = enabledTypes.includes(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleQuestionType(type)}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-4 h-4"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Active Question Type Configuration Cards */}
          <div className="space-y-4 pt-2">
            {enabledTypes.map((typeName) => {
              const rows = typeConfigs[typeName] || [];
              return (
                <div
                  key={typeName}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden shadow-2xs"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{typeName}</span>
                    <button
                      type="button"
                      onClick={() => addRow(typeName)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#f39223] hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Add <Plus size={13} />
                    </button>
                  </div>

                  {/* Card Rows */}
                  <div className="p-4 space-y-3">
                    {rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex flex-wrap lg:flex-nowrap items-center gap-4 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]"
                      >
                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => removeRow(typeName, row.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer shrink-0"
                          title="Delete row"
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* Number of Questions */}
                        <div className="w-36 shrink-0">
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Number of Questions
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={row.count}
                            onChange={(e) =>
                              updateRow(typeName, row.id, { count: Math.min(10, Math.max(1, Number(e.target.value))) })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-orange-400"
                          />
                          <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                            (Maximum 10 questions allowed)
                          </span>
                        </div>

                        {/* Mark */}
                        <div className="w-24 shrink-0">
                          <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                            Mark
                          </label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={row.marks}
                            onChange={(e) =>
                              updateRow(typeName, row.id, { marks: Math.max(0.5, Number(e.target.value)) })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-orange-400"
                          />
                        </div>

                        {/* Difficulty Level Checkboxes */}
                        <div className="shrink-0 space-y-1">
                          <span className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                            Difficulty Level
                          </span>
                          <div className="flex items-center gap-3">
                            {DIFFICULTY_LEVELS.map((diff) => {
                              const isChecked = row.difficultyLevels.includes(diff);
                              return (
                                <label
                                  key={diff}
                                  className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = isChecked
                                        ? row.difficultyLevels.filter((d) => d !== diff)
                                        : [...row.difficultyLevels, diff];
                                      updateRow(typeName, row.id, {
                                        difficultyLevels: next.length ? next : ['Easy'],
                                      });
                                    }}
                                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-3.5 h-3.5"
                                  />
                                  <span>{diff}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bloom Taxonomy Checkboxes */}
                        <div className="flex-1 space-y-1 min-w-[280px]">
                          <span className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                            Bloom Taxonomy
                          </span>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {BLOOM_TAXONOMIES.map((bloom) => {
                              const isChecked = row.bloomTaxonomies.includes(bloom);
                              return (
                                <label
                                  key={bloom}
                                  className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] cursor-pointer select-none"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const next = isChecked
                                        ? row.bloomTaxonomies.filter((b) => b !== bloom)
                                        : [...row.bloomTaxonomies, bloom];
                                      updateRow(typeName, row.id, {
                                        bloomTaxonomies: next.length ? next : ['Remember'],
                                      });
                                    }}
                                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-3.5 h-3.5"
                                  />
                                  <span>{bloom}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Centered Submit Button: Send to AI */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleSendToAI}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#f39223] hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
            >
              <Sparkles size={18} />
              Send to AI
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: GENERATING SCREEN / MODAL */}
      {step === 'generating' && (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400 animate-bounce">
            <Sparkles size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Generating Curriculum-Aligned Questions
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {generatingStatus}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-[#f39223] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${generatingProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)] pt-2">
            <span className="inline-flex items-center gap-1">
              <Check size={14} className="text-emerald-500" /> {syllabus} • {classGrade}
            </span>
            <span className="inline-flex items-center gap-1">
              <Check size={14} className="text-emerald-500" /> {subject}
            </span>
            <span className="inline-flex items-center gap-1">
              <Check size={14} className="text-emerald-500" /> Bloom's Taxonomy
            </span>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW SCREEN ("once generated preview generated question than move to pool") */}
      {step === 'preview' && (
        <div className="space-y-5">
          {/* Summary & Selection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedQuestionIds.size === totalQuestionsCount && totalQuestionsCount > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-4 h-4"
                />
                <span>Select All ({totalQuestionsCount})</span>
              </label>

              <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Selected: <strong className="text-orange-600">{selectedQuestionIds.size}</strong> of {totalQuestionsCount}
              </span>

              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)]">
                Total Marks: {totalMarks} pts
              </span>

              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                {syllabus} • {classGrade} • {subject}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMoveToPool}
              disabled={selectedQuestionIds.size === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#f39223] hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              Move to Pool ({selectedQuestionIds.size})
            </button>
          </div>

          {/* Generated Question Cards */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => {
              const isSelected = selectedQuestionIds.has(q.id);
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-orange-300 bg-[var(--bg-card)] shadow-xs ring-1 ring-orange-200 dark:ring-orange-900/40'
                      : 'border-[var(--border-color)] bg-[var(--bg-main)] opacity-70'
                  }`}
                >
                  {/* Question Card Header */}
                  <div className="flex items-center justify-between gap-3 p-4 border-b border-[var(--border-color)] bg-[var(--bg-main)] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectQuestion(q.id)}
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer w-4 h-4"
                      />
                      <span className="text-xs font-extrabold text-[var(--text-primary)]">
                        Question #{idx + 1}
                      </span>

                      {/* Badges */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 uppercase tracking-wide">
                        {q.type.replace(/_/g, ' ')}
                      </span>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)]">
                        {q.difficulty}
                      </span>

                      {q.bloomsTaxonomy && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50">
                          {q.bloomsTaxonomy}
                        </span>
                      )}

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                        {q.marks} pt{q.marks > 1 ? 's' : ''}
                      </span>

                      {q.level && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                          {q.level}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={isEditing ? 'Save edits' : 'Edit question prompt'}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGeneratedQuestion(q.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Remove question"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="p-5 space-y-4">
                    {isEditing ? (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                          Edit Question Prompt
                        </label>
                        <textarea
                          rows={2}
                          value={q.prompt}
                          onChange={(e) => updateGeneratedQuestionPrompt(q.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-orange-300 bg-[var(--bg-main)] text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
                        {q.prompt}
                      </p>
                    )}

                    {/* Options Preview for MCQ / MMCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect =
                            q.type === 'mcq'
                              ? q.correctOptionIndex === oIdx
                              : q.correctOptionIndices?.includes(oIdx);

                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition ${
                                isCorrect
                                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : 'border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-secondary)]'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                                  <Check size={11} /> Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Match the Following Preview */}
                    {q.type === 'match_following' && q.matchingPairs && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">Correct Matching Pairs:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.matchingPairs.map((pair, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs"
                            >
                              <span className="font-bold text-[var(--text-primary)]">{pair.leftText}</span>
                              <span className="text-emerald-600 font-bold">→</span>
                              <span className="font-semibold text-emerald-800 dark:text-emerald-300">{pair.rightText}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step / Sequence Ordering Preview */}
                    {q.type === 'step_ordering' && q.orderedSteps && (
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">Correct Sequence Order:</span>
                        <div className="space-y-1.5">
                          {q.orderedSteps.map((stepText, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--bg-main)] text-xs"
                            >
                              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span className="font-medium text-[var(--text-primary)] leading-relaxed">{stepText}</span>
                            </div>
                          ))}
                        </div>
                        {q.distractorSteps && q.distractorSteps.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Distractor / Decoy Steps:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {q.distractorSteps.map((dist, dIdx) => (
                                <span key={dIdx} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-[11px]">
                                  {dist}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation / Rationale */}
                    {q.explanation && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/30 text-xs">
                        <Info size={15} className="text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-orange-800 dark:text-orange-300">
                            Pedagogical Rationale:{' '}
                          </strong>
                          <span className="text-orange-900/80 dark:text-orange-200">
                            {q.explanation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-[var(--bg-card)]/95 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Configuration
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)]">
                {selectedQuestionIds.size} question{selectedQuestionIds.size === 1 ? '' : 's'} selected
              </span>
              <button
                type="button"
                onClick={handleMoveToPool}
                disabled={selectedQuestionIds.size === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f39223] hover:bg-orange-600 text-white text-xs font-extrabold transition shadow-md disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Move {selectedQuestionIds.size} Question{selectedQuestionIds.size === 1 ? '' : 's'} to Pool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Realistic mock generator synthesizing questions based on criteria
function generateMockAIQuestions(params: {
  syllabus: string;
  classGrade: string;
  subject: string;
  chapter: string;
  uploadedFile: { name: string; size: string } | null;
  enabledTypes: QuestionTypeName[];
  typeConfigs: Record<string, CriteriaRow[]>;
}): PoolQuestion[] {
  const result: PoolQuestion[] = [];
  const { syllabus, classGrade, subject, chapter } = params;

  // Question templates by subject
  const subjectQuestionBanks: Record<
    string,
    {
      mcq: Array<{ prompt: string; options: string[]; correctOptionIndex: number; explanation: string }>;
      mmcq: Array<{ prompt: string; options: string[]; correctOptionIndices: number[]; explanation: string }>;
      true_false: Array<{ prompt: string; isTrue: boolean; explanation: string }>;
      match_following: Array<{ prompt: string; matchingPairs: Array<{ id: string; leftText: string; rightText: string }>; explanation: string }>;
      step_ordering: Array<{ prompt: string; orderedSteps: string[]; distractorSteps?: string[]; explanation: string }>;
    }
  > = {
    Physics: {
      mcq: [
        {
          prompt: "According to Ohm's law, if the potential difference across a conductor is doubled while temperature and resistance remain constant, what happens to the electric current?",
          options: ['It remains unchanged', 'It is halved', 'It is doubled', 'It increases fourfold'],
          correctOptionIndex: 2,
          explanation: 'Ohm\'s Law states V = IR. When resistance is constant, current (I) is directly proportional to potential difference (V).',
        },
        {
          prompt: 'Which of the following materials has the highest electrical resistivity at 20°C, making it suitable for heating coils?',
          options: ['Silver', 'Copper', 'Nichrome', 'Aluminium'],
          correctOptionIndex: 2,
          explanation: 'Nichrome is an alloy with very high electrical resistivity and does not oxidize readily at high temperatures.',
        },
        {
          prompt: 'A concave mirror produces a real, inverted image of the same size as the object. Where is the object placed?',
          options: ['At infinity', 'Between Focus and Center of Curvature', 'At the Center of Curvature (C)', 'At the Principal Focus (F)'],
          correctOptionIndex: 2,
          explanation: 'When an object is placed at the center of curvature (C) of a concave mirror, the image is formed at C, real, inverted and of the same size.',
        },
      ],
      mmcq: [
        {
          prompt: 'Which of the following factors directly affect the electrical resistance of a uniform cylindrical metallic wire? (Select all that apply)',
          options: ['Length of the wire', 'Cross-sectional area of the wire', 'Resistivity of the material', 'Direction of the electric current'],
          correctOptionIndices: [0, 1, 2],
          explanation: 'Resistance is given by R = ρ(L/A). It depends on length (L), area (A), and material resistivity (ρ), not on current direction.',
        },
        {
          prompt: 'Which statements are correct regarding magnetic field lines produced by a straight current-carrying conductor? (Select all that apply)',
          options: [
            'They form concentric circular loops centered on the wire',
            'Their direction is given by Maxwell\'s right-hand thumb rule',
            'Field strength decreases with increasing distance from the conductor',
            'Field lines intersect each other when current is doubled',
          ],
          correctOptionIndices: [0, 1, 2],
          explanation: 'Magnetic field lines around a straight wire form concentric circles whose strength decreases with distance. Field lines never intersect.',
        },
      ],
      true_false: [
        {
          prompt: 'The magnetic field inside a long straight current-carrying solenoid is uniform throughout its interior.',
          isTrue: true,
          explanation: 'The magnetic field lines inside a solenoid are parallel straight lines, indicating a uniform magnetic field.',
        },
        {
          prompt: 'Electric power consumed in a circuit is inversely proportional to the square of current.',
          isTrue: false,
          explanation: 'Electric power is given by P = I²R, which is directly proportional to the square of current.',
        },
      ],
      match_following: [
        {
          prompt: 'Match the following physical quantities with their corresponding standard SI units and formula representations:',
          matchingPairs: [
            { id: '1', leftText: "Ohm's Law", rightText: 'V = I × R' },
            { id: '2', leftText: 'Electric Current', rightText: 'Ampere (A)' },
            { id: '3', leftText: 'Electrical Resistance', rightText: 'Ohm (Ω)' },
            { id: '4', leftText: 'Electric Potential Difference', rightText: 'Volt (V)' },
          ],
          explanation: 'Ohm\'s law establishes V = IR. The standard SI units are Ampere (Coulombs/sec), Ohm (Volt/Ampere), and Volt (Joules/Coulomb).',
        },
        {
          prompt: 'Match the electromagnetic devices with their primary functional roles in a laboratory circuit:',
          matchingPairs: [
            { id: '1', leftText: 'Rheostat', rightText: 'Variable resistance regulator' },
            { id: '2', leftText: 'Ammeter', rightText: 'Measures current in series' },
            { id: '3', leftText: 'Voltmeter', rightText: 'Measures potential drop in parallel' },
            { id: '4', leftText: 'Electric Fuse', rightText: 'Excess current safety cutoff' },
          ],
          explanation: 'Rheostats change circuit resistance without interruption; ammeters must be in series, voltmeters in parallel, and fuses protect against overload.',
        },
      ],
      step_ordering: [
        {
          prompt: 'Arrange the experimental steps in the correct chronological sequence to verify Ohm\'s Law in the laboratory:',
          orderedSteps: [
            'Assemble the circuit by connecting battery, plug key, ammeter, and unknown resistor in series.',
            'Connect the high-resistance voltmeter in parallel directly across the unknown resistor.',
            'Insert the key and adjust the rheostat slider to set an initial minimal current.',
            'Record the ammeter reading (I) and the voltmeter reading (V) in the observation table.',
            'Repeat for different rheostat positions and calculate R = V/I to verify a constant linear ratio.',
          ],
          distractorSteps: [
            'Connect the voltmeter in series with the battery before taking current readings.',
          ],
          explanation: 'Experimental verification of Ohm\'s law requires voltmeter connected in parallel with the resistor and ammeter in series, followed by plotting V vs I.',
        },
      ],
    },
    Mathematics: {
      mcq: [
        {
          prompt: 'If one zero of the quadratic polynomial x² + 3x + k is 2, what is the value of the constant k?',
          options: ['10', '-10', '-7', '-2'],
          correctOptionIndex: 1,
          explanation: 'Substituting x = 2: (2)² + 3(2) + k = 0 => 4 + 6 + k = 0 => k = -10.',
        },
        {
          prompt: 'What is the discriminant of the quadratic equation 2x² - 4x + 3 = 0?',
          options: ['-8 (No real roots)', '8 (Two real roots)', '0 (Equal roots)', '16'],
          correctOptionIndex: 0,
          explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, there are no real roots.',
        },
      ],
      mmcq: [
        {
          prompt: 'Which of the following equations represent quadratic equations in one variable? (Select all that apply)',
          options: ['x² + 2x + 1 = (4 - x)² + 3', 'x(x + 1) + 8 = (x + 2)(x - 2)', 'x³ - x² = (x - 1)³', '(x + 2)³ = 2x(x² - 1)'],
          correctOptionIndices: [0, 2],
          explanation: 'Option A and C reduce to degree 2 quadratic equations after expansion.',
        },
      ],
      true_false: [
        {
          prompt: 'Every quadratic equation has at most two distinct real roots.',
          isTrue: true,
          explanation: 'By the Fundamental Theorem of Algebra, a polynomial of degree n has at most n roots.',
        },
      ],
      match_following: [
        {
          prompt: 'Match the quadratic discriminant values (D = b² - 4ac) with the nature of the roots:',
          matchingPairs: [
            { id: '1', leftText: 'Discriminant D > 0', rightText: 'Two distinct real roots' },
            { id: '2', leftText: 'Discriminant D = 0', rightText: 'Two equal real roots' },
            { id: '3', leftText: 'Discriminant D < 0', rightText: 'No real roots (complex conjugates)' },
            { id: '4', leftText: 'D is a perfect square', rightText: 'Two rational distinct roots' },
          ],
          explanation: 'The sign and squareness of D determines whether roots are real, distinct, equal, or rational.',
        },
      ],
      step_ordering: [
        {
          prompt: 'Arrange the sequence of steps to solve the quadratic equation ax² + bx + c = 0 by completing the square:',
          orderedSteps: [
            'Divide both sides by coefficient a to make the leading coefficient of x² equal to 1.',
            'Transpose the constant term (c/a) to the right-hand side of the equation.',
            'Add the square of half the coefficient of x, namely (b / 2a)², to both sides.',
            'Factor the left side as the perfect square [x + b/(2a)]².',
            'Take the square root of both sides and solve for x = (-b ± √(b² - 4ac)) / (2a).',
          ],
          distractorSteps: [
            'Multiply both sides by the discriminant D prior to factoring.',
          ],
          explanation: 'Completing the square systematically transforms ax² + bx + c = 0 into [x + b/(2a)]² = (b² - 4ac)/(4a²).',
        },
      ],
    },
    Chemistry: {
      mcq: [
        {
          prompt: 'What happens when dilute hydrochloric acid is added to iron fillings in a test tube?',
          options: [
            'Hydrogen gas and iron chloride are produced',
            'Chlorine gas and iron hydroxide are produced',
            'No reaction takes place',
            'Iron salt and water are produced',
          ],
          correctOptionIndex: 0,
          explanation: 'Fe + 2HCl -> FeCl2 + H2(g). Hydrogen gas and iron(II) chloride are generated.',
        },
      ],
      mmcq: [
        {
          prompt: 'Which of the following are exothermic chemical processes? (Select all that apply)',
          options: ['Reaction of water with quick lime', 'Dilution of an acid', 'Evaporation of water', 'Respiration in living organisms'],
          correctOptionIndices: [0, 1, 3],
          explanation: 'Reaction of CaO with H2O, acid dilution, and cellular respiration all release heat energy (exothermic). Evaporation absorbs heat (endothermic).',
        },
      ],
      true_false: [
        {
          prompt: 'Rusting of iron is a chemical change that involves both oxidation and reduction (redox reaction).',
          isTrue: true,
          explanation: 'Iron is oxidized to Fe3+ while oxygen is reduced in the presence of water.',
        },
      ],
      match_following: [
        {
          prompt: 'Match the common chemical compounds with their correct chemical names and formulas:',
          matchingPairs: [
            { id: '1', leftText: 'Quicklime', rightText: 'Calcium oxide (CaO)' },
            { id: '2', leftText: 'Slaked lime', rightText: 'Calcium hydroxide [Ca(OH)₂]' },
            { id: '3', leftText: 'Limestone', rightText: 'Calcium carbonate (CaCO₃)' },
            { id: '4', leftText: 'Bleaching powder', rightText: 'Calcium oxychloride (CaOCl₂)' },
          ],
          explanation: 'Calcium compounds have distinct everyday names based on their chemical hydration and carbonation states.',
        },
      ],
      step_ordering: [
        {
          prompt: 'Order the sequential observations when heating green ferrous sulphate crystals (FeSO₄·7H₂O) in a dry boiling tube:',
          orderedSteps: [
            'Place approximately 2g of green ferrous sulphate crystals in a dry boiling tube.',
            'Gently heat the boiling tube over a burner flame and observe water droplets condensing near the mouth.',
            'Observe the green color of crystals change to white as water of crystallization is lost.',
            'On further strong heating, observe the solid decompose into a reddish-brown ferric oxide (Fe₂O₃) residue.',
            'Smell the characteristic choking fumes of burning sulphur indicating evolution of SO₂ and SO₃ gases.',
          ],
          distractorSteps: [
            'Add concentrated nitric acid to the crystals before heating.',
          ],
          explanation: 'Thermal decomposition: FeSO₄·7H₂O loses water, then 2FeSO₄(s) decomposes into Fe₂O₃(s) + SO₂(g) + SO₃(g).',
        },
      ],
    },
  };

  const bank = subjectQuestionBanks[subject] || subjectQuestionBanks['Physics'];

  // Process enabled types
  for (const typeName of params.enabledTypes) {
    const rows = params.typeConfigs[typeName] || [];
    for (const row of rows) {
      for (let i = 0; i < row.count; i++) {
        const diff = row.difficultyLevels[i % row.difficultyLevels.length] || 'Easy';
        const bloom = (row.bloomTaxonomies[i % row.bloomTaxonomies.length] || 'Understand') as BloomsTaxonomyLevel;
        const marks = row.marks || 1;
        const level: QuestionLevel = marks <= 1 ? 'Level 1' : marks === 2 ? 'Level 2' : marks === 3 ? 'Level 3' : 'Level 4';

        if (typeName === 'Multiple Choice Question') {
          const tpl = bank.mcq[(result.length + i) % bank.mcq.length];
          result.push({
            id: crypto.randomUUID(),
            type: 'mcq',
            prompt: tpl.prompt,
            board: syllabus,
            classGrade,
            subject,
            chapter,
            topic: chapter,
            marks,
            difficulty: diff,
            bloomsTaxonomy: bloom,
            level,
            options: [...tpl.options],
            correctOptionIndex: tpl.correctOptionIndex,
            explanation: tpl.explanation,
            tags: [syllabus, subject, diff, 'AI-Generated'],
          });
        } else if (typeName === 'Multi-Multiple Choice Question') {
          const tpl = bank.mmcq[(result.length + i) % bank.mmcq.length];
          result.push({
            id: crypto.randomUUID(),
            type: 'mmcq',
            prompt: tpl.prompt,
            board: syllabus,
            classGrade,
            subject,
            chapter,
            topic: chapter,
            marks,
            difficulty: diff,
            bloomsTaxonomy: bloom,
            level,
            options: [...tpl.options],
            correctOptionIndices: tpl.correctOptionIndices,
            minSelections: 1,
            explanation: tpl.explanation,
            tags: [syllabus, subject, diff, 'AI-Generated'],
          });
        } else if (typeName === 'True/False') {
          const tpl = bank.true_false[(result.length + i) % bank.true_false.length];
          result.push({
            id: crypto.randomUUID(),
            type: 'mcq',
            prompt: tpl.prompt,
            board: syllabus,
            classGrade,
            subject,
            chapter,
            topic: chapter,
            marks,
            difficulty: diff,
            bloomsTaxonomy: bloom,
            level,
            options: ['True', 'False'],
            correctOptionIndex: tpl.isTrue ? 0 : 1,
            explanation: tpl.explanation,
            tags: [syllabus, subject, diff, 'True-False', 'AI-Generated'],
          });
        } else if (typeName === 'Match the Following') {
          const tpl = bank.match_following[(result.length + i) % bank.match_following.length];
          result.push({
            id: crypto.randomUUID(),
            type: 'match_following',
            prompt: tpl.prompt,
            board: syllabus,
            classGrade,
            subject,
            chapter,
            topic: chapter,
            marks: marks || 4,
            difficulty: diff,
            bloomsTaxonomy: bloom,
            level: 'Level 3',
            matchingPairs: tpl.matchingPairs.map(p => ({ ...p, id: crypto.randomUUID() })),
            explanation: tpl.explanation,
            tags: [syllabus, subject, diff, 'Matching', 'AI-Generated'],
          });
        } else if (typeName === 'Sequence Ordering') {
          const tpl = bank.step_ordering[(result.length + i) % bank.step_ordering.length];
          result.push({
            id: crypto.randomUUID(),
            type: 'step_ordering',
            prompt: tpl.prompt,
            board: syllabus,
            classGrade,
            subject,
            chapter,
            topic: chapter,
            marks: marks || 3,
            difficulty: diff,
            bloomsTaxonomy: bloom,
            level: 'Level 2',
            orderedSteps: [...tpl.orderedSteps],
            distractorSteps: [...(tpl.distractorSteps || [])],
            explanation: tpl.explanation,
            tags: [syllabus, subject, diff, 'Sequencing', 'AI-Generated'],
          });
        }
      }
    }
  }

  return result;
}
