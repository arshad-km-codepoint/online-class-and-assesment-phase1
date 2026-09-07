import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { QuestionPoolBrowser } from '../components/QuestionPoolBrowser';
import { AcademicTaxonomyBar } from '../components/common/AcademicTaxonomyBar';
import { defaultAssessmentSection, sectionIdFor, orderQuestionsBySection } from '../utils/assessmentSections';
import { bloomsTaxonomyLevels, bloomsTaxonomyColors } from '../utils/questionPool';
import { useExam } from '../context/ExamContext';
import {
  LiveInClassAssessment,
  LiveAssessmentSection,
  LiveAssessmentQuestion,
  LiveAssessmentQuestionType,
  BloomsTaxonomyLevel,
  MatchingPairItem,
  BlankSlotItem,
} from '../types';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Save,
  Eye,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Zap,
  X,
  AlertCircle,
  BookOpen,
  ListOrdered,
} from 'lucide-react';

export const CreateClassAssessmentView: React.FC = () => {
  const {
    editingLiveAssessment,
    setEditingLiveAssessment,
    saveLiveAssessment,
    launchSavedAssessmentInClass,
    setActiveTab,
    onlineClasses,
    activeLiveClass,
    addToast,
  } = useExam();

  // Basic Form State
  const [assessmentId] = useState<string>(
    editingLiveAssessment?.id || 'live-ass-' + Date.now().toString(36)
  );
  const [title, setTitle] = useState<string>(
    editingLiveAssessment?.title || 'Spot Check: New In-Class Assessment'
  );
  const [board, setBoard] = useState<string>(
    editingLiveAssessment?.board || 'CBSE'
  );
  const [classGrade, setClassGrade] = useState<string>(
    editingLiveAssessment?.classGrade || 'Class 12'
  );
  const [subject, setSubject] = useState<string>(
    editingLiveAssessment?.subject || 'Physics'
  );
  const [chapter, setChapter] = useState<string>(
    editingLiveAssessment?.chapter || 'Electricity & Electromagnetic Induction'
  );
  const [topic, setTopic] = useState<string>(
    editingLiveAssessment?.topic || 'Core Concepts & Analytical Application'
  );
  const [targetClass, setTargetClass] = useState<string>(
    editingLiveAssessment?.targetClass || 'Grade 12 - Section A'
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    editingLiveAssessment?.durationSeconds ?? 180
  );
  const [passMarks, setPassMarks] = useState<number>(
    editingLiveAssessment?.passMarks ?? 1
  );
  const [instructions, setInstructions] = useState<string>(
    editingLiveAssessment?.instructions ||
      'Complete all questions within the allocated time. Multi-select questions require picking all valid answers.'
  );

  // Questions List State
  const [questions, setQuestions] = useState<LiveAssessmentQuestion[]>(
    editingLiveAssessment?.questions || []
  );

  const [sections, setSections] = useState<LiveAssessmentSection[]>(() =>
    editingLiveAssessment?.sections?.length ? editingLiveAssessment.sections : [defaultAssessmentSection()]
  );
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ sectionId: string; beforeId?: string } | null>(null);
  const dropSectionId = dropTarget?.sectionId;
  const [sectionAnnouncement, setSectionAnnouncement] = useState('');
  const [step, setStep] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const orderedQuestions = orderQuestionsBySection(questions, sections);
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0];
  const sectionQuestions = questions.filter(q => sectionIdFor(q, sections) === activeSection.id);
  const selectedId = sectionQuestions.some(q => q.id === selectedQuestionId) ? selectedQuestionId : sectionQuestions[0]?.id;
  const sectionLabel = (section: LiveAssessmentSection) => section.title?.trim() || `Section ${sections.findIndex(item => item.id === section.id) + 1}`;
  const selectQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) setActiveSectionId(sectionIdFor(question, sections));
    setSelectedQuestionId(id);
  };
  const addSection = () => {
    const section = { id: 'section-' + crypto.randomUUID(), title: '', description: '' };
    setSections(prev => [...prev, section]);
    setActiveSectionId(section.id);
    setSelectedQuestionId(null);
    setSectionAnnouncement('New section added. Search the question pool to add questions.');
  };
  const moveToSection = (questionId: string, targetId: string, beforeId?: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question || questionId === beforeId || !sections.some(section => section.id === targetId)) return;
    setQuestions(prev => {
      const remaining = prev.filter(q => q.id !== questionId);
      const index = beforeId ? remaining.findIndex(q => q.id === beforeId) : -1;
      remaining.splice(index < 0 ? remaining.length : index, 0, { ...question, sectionId: targetId });
      return remaining;
    });
    setActiveSectionId(targetId);
    setSelectedQuestionId(questionId);
    setDraggedQuestionId(null);
    setDropTarget(null);
    setSectionAnnouncement(`Question moved to ${sectionLabel(sections.find(section => section.id === targetId)!)}.`);
  };
  // Snap to the nearest insertion slot without moving rows during a drag.
  const getDropTarget = (event: React.DragEvent<HTMLDivElement>, sectionId: string) => {
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-question-id]'))
      .filter(row => row.dataset.questionId !== draggedQuestionId);
    const next = rows.find(row => {
      const bounds = row.getBoundingClientRect();
      return event.clientY < bounds.top + bounds.height / 2;
    });
    return { sectionId, beforeId: next?.dataset.questionId };
  };
  const renderDropIndicator = () => (
    <div aria-hidden="true" className="pointer-events-none absolute -top-0.5 inset-x-0 z-10 flex items-center motion-safe:animate-pulse">
      <span className="h-2.5 w-2.5 rounded-full bg-[#f39223] ring-2 ring-white" />
      <span className="h-0.5 flex-1 bg-[#f39223] shadow-sm" />
      <span className="absolute right-1 -top-5 rounded-md bg-[#f39223] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">Drop here</span>
    </div>
  );
  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    const destination = sections.find(section => section.id !== id)!;
    setQuestions(prev => prev.map(q => sectionIdFor(q, sections) === id ? { ...q, sectionId: destination.id } : q));
    setSections(prev => prev.filter(section => section.id !== id));
    setActiveSectionId(destination.id);
    setSectionAnnouncement(`Section removed. Its questions were moved to ${sectionLabel(destination)}.`);
  };
  const steps = ['Assessment details', 'Build questions', 'Review & share'];
  const typeLabels: Record<string, string> = {
    mcq: 'Single choice', mmcq: 'Multiple choice', fill_in_blanks: 'Fill in the blanks',
    match_following: 'Matching pairs', step_ordering: 'Sequence ordering',
  };
  const goToStep = (next: number) => {
    setStep(next);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Calculate total marks automatically
  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Add Question Handlers for Question Types
  const handleAddMCQ = () => {
    const newQ: LiveAssessmentQuestion = {
      sectionId: activeSection.id,
      id: 'q-mcq-' + Date.now().toString(36),
      type: 'mcq',
      prompt: 'New Multiple Choice Question Prompt...',
      marks: 2,
      bloomsTaxonomy: 'Remember',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      explanation: 'Detailed explanation for the correct choice...',
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
    addToast('MCQ Question Added', 'Configure choices and radio button for correct answer.', 'info');
  };

  const handleAddMMCQ = () => {
    const newQ: LiveAssessmentQuestion = {
      sectionId: activeSection.id,
      id: 'q-mmcq-' + Date.now().toString(36),
      type: 'mmcq',
      prompt: 'Select ALL correct statements that apply (Multiple Choices):',
      marks: 3,
      bloomsTaxonomy: 'Analyze',
      options: ['Statement A', 'Statement B', 'Statement C', 'Statement D'],
      correctOptionIndices: [0, 1],
      minSelections: 2,
      explanation: 'Explanation specifying which choices are correct...',
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
    addToast('MMCQ Question Added', 'Check the boxes for all correct answers.', 'info');
  };

  const handleAddFillInBlanks = () => {
    const newQ: LiveAssessmentQuestion = {
      sectionId: activeSection.id,
      id: 'q-fib-' + Date.now().toString(36),
      type: 'fill_in_blanks',
      prompt: 'Fill in the blanks to complete the statement:',
      marks: 3,
      bloomsTaxonomy: 'Understand',
      blankSlots: [
        {
          id: 'b-1',
          label: 'Blank 1',
          sentencePrefix: 'The formula for kinetic energy is 1/2 · m ·',
          sentenceSuffix: '',
          correctAnswer: 'v²',
        },
        {
          id: 'b-2',
          label: 'Blank 2',
          sentencePrefix: 'Work done by a conservative force along a closed path is',
          sentenceSuffix: '',
          correctAnswer: 'zero',
        },
      ],
      blankOptions: ['v²', 'zero', 'v', 'infinity', 'mgh'],
      explanation: 'KE = 1/2 m v². Conservative forces do zero work in a closed loop.',
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
    addToast('Fill in Blanks Added', 'Define prefix, suffix, correct answers, and word pool.', 'info');
  };

  const handleAddMatchFollowing = () => {
    const newQ: LiveAssessmentQuestion = {
      sectionId: activeSection.id,
      id: 'q-match-' + Date.now().toString(36),
      type: 'match_following',
      prompt: 'Match each item in Column A with its corresponding item in Column B:',
      marks: 4,
      bloomsTaxonomy: 'Understand',
      matchingPairs: [
        { id: 'p-1', leftText: 'Column A - Item 1', rightText: 'Column B - Match 1' },
        { id: 'p-2', leftText: 'Column A - Item 2', rightText: 'Column B - Match 2' },
        { id: 'p-3', leftText: 'Column A - Item 3', rightText: 'Column B - Match 3' },
      ],
      explanation: 'Explanation for correct column pairings...',
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
    addToast('Match the Following Added', 'Add Column A and Column B pair rows.', 'info');
  };

  const handleAddStepOrdering = () => {
    const newQ: LiveAssessmentQuestion = {
      sectionId: activeSection.id,
      id: 'q-step-' + Date.now().toString(36),
      type: 'step_ordering',
      prompt:
        'Arrange the following solution steps in their exact logical sequence (Distractor/incorrect steps are mixed in):',
      marks: 4,
      bloomsTaxonomy: 'Apply',
      orderedSteps: [
        'Step 1: Write equation in standard form: 2x² + 5x - 3 = 0',
        'Step 2: Split middle term using product-sum rule: 2x² + 6x - x - 3 = 0',
        'Step 3: Group terms to factor out GCF: 2x(x + 3) - 1(x + 3) = 0',
        'Step 4: Factor the common binomial: (2x - 1)(x + 3) = 0',
        'Step 5: Apply zero product property: x = 1/2 or x = -3',
      ],
      distractorSteps: [
        'Distractor: Incorrect middle split: 2x² + 3x + 2x - 3 = 0',
        'Distractor: Incorrect binomial signs: (2x + 1)(x - 3) = 0',
      ],
      explanation:
        'The factors of (2)(-3) = -6 that add up to +5 are +6 and -1. Grouping yields (2x - 1)(x + 3) = 0, giving roots x = 1/2, -3.',
    };
    setQuestions((prev) => [...prev, newQ]);
    setSelectedQuestionId(newQ.id);
    addToast(
      'Step Ordering Added',
      'Add sequential solution steps and optional distractor/wrong steps.',
      'info'
    );
  };

  // Question Management Handlers
  const handleUpdateQuestion = (id: string, updates: Partial<LiveAssessmentQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDuplicateQuestion = (id: string) => {
    const target = questions.find((q) => q.id === id);
    if (!target) return;
    const clone: LiveAssessmentQuestion = {
      ...target,
      sectionId: sectionIdFor(target, sections),
      id: 'q-' + Date.now().toString(36),
      prompt: `${target.prompt} (Copy)`,
    };
    setQuestions((prev) => [...prev, clone]);
    setSelectedQuestionId(clone.id);
  };

  const handleMoveQuestion = (id: string, direction: 'up' | 'down') => {
    const current = sectionQuestions.findIndex(q => q.id === id);
    const next = direction === 'up' ? current - 1 : current + 1;
    if (current < 0 || next < 0 || next >= sectionQuestions.length) return;
    setQuestions(prev => {
      const copy = [...prev];
      const first = copy.findIndex(q => q.id === id);
      const second = copy.findIndex(q => q.id === sectionQuestions[next].id);
      [copy[first], copy[second]] = [copy[second], copy[first]];
      return copy;
    });
  };

  // Option handlers for MCQ / MMCQ
  const handleAddOption = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentOptions = q.options || [];
    const nextLetter = String.fromCharCode(65 + currentOptions.length);
    handleUpdateQuestion(qId, {
      options: [...currentOptions, `Option ${nextLetter}`],
    });
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.options || q.options.length <= 2) {
      addToast('Minimum Options', 'Question must have at least 2 options.', 'warning');
      return;
    }
    const updatedOptions = q.options.filter((_, idx) => idx !== optIndex);
    const updates: Partial<LiveAssessmentQuestion> = { options: updatedOptions };
    if (q.correctOptionIndex !== undefined && q.correctOptionIndex >= updatedOptions.length) {
      updates.correctOptionIndex = 0;
    }
    if (q.correctOptionIndices) {
      updates.correctOptionIndices = q.correctOptionIndices
        .filter((idx) => idx !== optIndex)
        .map((idx) => (idx > optIndex ? idx - 1 : idx));
    }
    handleUpdateQuestion(qId, updates);
  };

  const handleToggleMMCQCorrect = (qId: string, optIndex: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const current = q.correctOptionIndices || [];
    const exists = current.includes(optIndex);
    const next = exists ? current.filter((i) => i !== optIndex) : [...current, optIndex];
    if (next.length === 0) {
      addToast('Required', 'Select at least 1 correct answer option.', 'warning');
      return;
    }
    handleUpdateQuestion(qId, { correctOptionIndices: next });
  };

  // Blank slots handlers
  const handleAddBlankSlot = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentSlots = q.blankSlots || [];
    const newSlot: BlankSlotItem = {
      id: 'b-' + Date.now().toString(36),
      label: `Blank ${currentSlots.length + 1}`,
      sentencePrefix: 'Sentence context for new blank:',
      sentenceSuffix: '',
      correctAnswer: 'Correct Term',
    };
    handleUpdateQuestion(qId, {
      blankSlots: [...currentSlots, newSlot],
    });
  };

  const handleRemoveBlankSlot = (qId: string, slotId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.blankSlots || q.blankSlots.length <= 1) {
      addToast('Minimum Blanks', 'Question must have at least 1 blank slot.', 'warning');
      return;
    }
    handleUpdateQuestion(qId, {
      blankSlots: q.blankSlots.filter((s) => s.id !== slotId),
    });
  };

  // Match pair handlers
  const handleAddMatchingPair = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentPairs = q.matchingPairs || [];
    const newPair: MatchingPairItem = {
      id: 'p-' + Date.now().toString(36),
      leftText: `Item ${currentPairs.length + 1}`,
      rightText: `Matching Value ${currentPairs.length + 1}`,
    };
    handleUpdateQuestion(qId, {
      matchingPairs: [...currentPairs, newPair],
    });
  };

  const handleRemoveMatchingPair = (qId: string, pairId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.matchingPairs || q.matchingPairs.length <= 2) {
      addToast('Minimum Pairs', 'Match question must have at least 2 pairs.', 'warning');
      return;
    }
    handleUpdateQuestion(qId, {
      matchingPairs: q.matchingPairs.filter((p) => p.id !== pairId),
    });
  };

  // Step Ordering and Sequence Proof Handlers
  const handleAddStepOrderingStep = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentSteps = q.orderedSteps || [];
    handleUpdateQuestion(qId, {
      orderedSteps: [
        ...currentSteps,
        `Step ${currentSteps.length + 1}: State next logical step or formula transformation...`,
      ],
    });
  };

  const handleUpdateStepOrderingStep = (qId: string, stepIdx: number, text: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentSteps = [...(q.orderedSteps || [])];
    currentSteps[stepIdx] = text;
    handleUpdateQuestion(qId, { orderedSteps: currentSteps });
  };

  const handleRemoveStepOrderingStep = (qId: string, stepIdx: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.orderedSteps || q.orderedSteps.length <= 2) {
      addToast('Minimum Steps', 'Step ordering question must have at least 2 sequential steps.', 'warning');
      return;
    }
    const currentSteps = q.orderedSteps.filter((_, idx) => idx !== stepIdx);
    handleUpdateQuestion(qId, { orderedSteps: currentSteps });
  };

  const handleMoveStepOrderingStep = (
    qId: string,
    stepIdx: number,
    direction: 'up' | 'down'
  ) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.orderedSteps) return;
    if (
      (direction === 'up' && stepIdx === 0) ||
      (direction === 'down' && stepIdx === q.orderedSteps.length - 1)
    ) {
      return;
    }
    const newIdx = direction === 'up' ? stepIdx - 1 : stepIdx + 1;
    const copy = [...q.orderedSteps];
    const item = copy.splice(stepIdx, 1)[0];
    copy.splice(newIdx, 0, item);
    handleUpdateQuestion(qId, { orderedSteps: copy });
  };

  const handleAddDistractorStep = (qId: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentDistractors = q.distractorSteps || [];
    handleUpdateQuestion(qId, {
      distractorSteps: [
        ...currentDistractors,
        `Distractor: Incorrect formula split, inverted sign, or false deduction...`,
      ],
    });
  };

  const handleUpdateDistractorStep = (qId: string, distIdx: number, text: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;
    const currentDistractors = [...(q.distractorSteps || [])];
    currentDistractors[distIdx] = text;
    handleUpdateQuestion(qId, { distractorSteps: currentDistractors });
  };

  const handleRemoveDistractorStep = (qId: string, distIdx: number) => {
    const q = questions.find((item) => item.id === qId);
    if (!q || !q.distractorSteps) return;
    const currentDistractors = q.distractorSteps.filter((_, idx) => idx !== distIdx);
    handleUpdateQuestion(qId, { distractorSteps: currentDistractors });
  };

  // Save Handlers
  const buildAssessmentObject = (status: 'active' | 'draft' | 'published'): LiveInClassAssessment => {
    return {
      id: assessmentId,
      title: title.trim() || 'Untitled Online Class Assessment',
      board,
      classGrade,
      subject,
      chapter,
      topic: topic.trim() || 'General Unit',
      targetClass,
      durationSeconds,
      totalMarks: totalCalculatedMarks,
      passMarks,
      status,
      isDraft: status === 'draft',
      createdAt: editingLiveAssessment?.createdAt || new Date().toISOString().split('T')[0],
      instructions,
      sections,
      questions: orderedQuestions.map(q => ({ ...q, sectionId: sectionIdFor(q, sections) })),
      submissions: editingLiveAssessment?.submissions || [],
    };
  };

  const validateForPublishing = () => {
    if (!title.trim() || !questions.length || questions.some(q => !q.prompt.trim())) {
      addToast('Complete your assessment', 'Add a title and a prompt for every question before sharing.', 'warning');
      return false;
    }
    if (!Number.isFinite(passMarks) || passMarks < 1 || passMarks > totalCalculatedMarks) {
      addToast('Check passing marks', `Choose a passing score between 1 and ${totalCalculatedMarks}.`, 'warning');
      goToStep(2);
      return false;
    }
    return true;
  };

  const handleSaveToBank = (isDraft: boolean = false) => {
    if (!title.trim()) {
      addToast('Title Required', 'Please enter an assessment title.', 'warning');
      return;
    }
    if (!isDraft && !validateForPublishing()) return;
    const assessment = buildAssessmentObject(isDraft ? 'draft' : 'published');
    saveLiveAssessment(assessment);
    setEditingLiveAssessment(null);
    setActiveTab('online-class-assessments');
  };

  const handleSaveAndLaunchLive = () => {
    if (!validateForPublishing()) return;
    if (!activeLiveClass && !onlineClasses.length) {
      addToast('No class available', 'Save to your library, then create a class to share this assessment.', 'warning');
      return;
    }
    if (!title.trim()) {
      addToast('Title Required', 'Please enter an assessment title.', 'warning');
      return;
    }
    const assessment = buildAssessmentObject('active');
    saveLiveAssessment(assessment);
    setEditingLiveAssessment(null);
    if (activeLiveClass) {
      launchSavedAssessmentInClass(assessment.id, activeLiveClass.id);
    } else if (onlineClasses.length > 0) {
      launchSavedAssessmentInClass(assessment.id, onlineClasses[0].id);
    }
    setActiveTab('live-classroom');
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => setShowPreviewModal(true)}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition cursor-pointer flex items-center gap-2"
      >
        <Eye className="w-4 h-4 text-[var(--primary)]" />
        <span>Student Preview</span>
      </button>

      <button
        type="button"
        onClick={() => handleSaveToBank(true)}
        className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 transition cursor-pointer border border-[var(--border-color)] bg-[var(--bg-card)]"
      >
        Save Draft
      </button>
    </>
  );

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
        { label: 'Class Assessments', onClick: () => setActiveTab('online-class-assessments') },
        { label: editingLiveAssessment ? 'Edit Assessment' : 'New Assessment', active: true },
      ]}
      title={editingLiveAssessment ? 'Edit Class Assessment' : 'Create In-Class Assessment'}
      subtitle="Design multi-format questions, structure exam sections, and broadcast to online lectures"
      onBack={() => setActiveTab('online-class-assessments')}
      actions={headerActions}
    >
      <div className="space-y-6 w-full">
        <nav aria-label="Assessment creation steps" className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-xs">
          {steps.map((label, index) => (
            <button
              key={label}
              onClick={() => goToStep(index)}
              aria-current={step === index ? 'step' : undefined}
              className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                step === index
                  ? 'bg-[var(--primary-light)]/40 text-[var(--primary-hover)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)]'
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  step === index
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                }`}
              >
                {index + 1}
              </span>
              <span className="text-xs sm:text-sm font-semibold">{label}</span>
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Step {step + 1} of 3</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">{['Start with the essentials', 'Make every question count', 'A final look before you share'][step]}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{['Give your assessment a name and choose who it is for.', 'Group questions into sections. Drag to move them, or use the Move to section menu.', 'Set the delivery rules, preview the experience, and choose how to share.'][step]}</p>
          </div>
          <span className="rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">{sections.length} {sections.length === 1 ? 'section' : 'sections'} · {questions.length} questions · {totalCalculatedMarks} marks</span>
        </div>

      {step === 0 && <>
      {/* Assessment Header Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#f39223]" />
            Assessment Details & Target Audience
          </span>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">
              Total Marks: <strong className="text-[#f39223] font-black">{totalCalculatedMarks}</strong>
            </span>
            <span>•</span>
            <span className="text-slate-600">
              Questions: <strong className="text-purple-600 font-black">{questions.length}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Assessment Title and Target Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Assessment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                aria-label="Assessment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spot Check: Differentiation Rules & Applications"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Target Cohort / Section</label>
              <select
                aria-label="Target class"
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
              >
                <option value="Grade 12 - Section A">Grade 12 - Section A</option>
                <option value="Grade 12 - Section B">Grade 12 - Section B</option>
                <option value="Grade 11 - Section A">Grade 11 - Section A</option>
                <option value="Grade 11 - Section B">Grade 11 - Section B</option>
                <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                <option value="All Classes">All Classes (General Pool)</option>
              </select>
            </div>
          </div>

          {/* Academic Curriculum Hierarchy Bar (CBSE | Select class | Select subject | Select chapter | Select topic) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Academic Curriculum Hierarchy (Board · Class · Subject · Chapter · Topic)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Used to find matching pool questions</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
              <AcademicTaxonomyBar
                values={{ board, classGrade, subject, chapter, topic }}
                onChange={(next) => {
                  setBoard(next.board);
                  setClassGrade(next.classGrade);
                  setSubject(next.subject);
                  setChapter(next.chapter);
                  setTopic(next.topic);
                }}
              />
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-[#fff4e6] p-4 text-sm text-[#c26d15] border border-[#fcd8b3]">Next, search the question pool and select questions. You can adjust the timer and passing marks in the final step.</div>
      </div>
      </>}

      {step === 1 && <>
      <QuestionPoolBrowser
        usedIds={questions.flatMap(q => q.poolQuestionId ? [q.poolQuestionId] : [])}
        initialTaxonomy={{ board, classGrade, subject, chapter, topic }}
        onAdd={items => {
        const additions = items.filter(item => !questions.some(q => q.poolQuestionId === item.id)).map(item => ({
          ...structuredClone(item), id: crypto.randomUUID(), poolQuestionId: item.id, sectionId: activeSection.id,
          board: item.board || board,
          classGrade: item.classGrade || classGrade,
          chapter: item.chapter || chapter,
          bloomsTaxonomy: item.bloomsTaxonomy || 'Apply',
        }));
        setQuestions(prev => [...prev, ...additions]);
        if (additions[0]) setSelectedQuestionId(additions[0].id);
        addToast('Questions added', `${additions.length} question(s) added to ${sectionLabel(activeSection)}.`, 'success');
      }} destination={sectionLabel(activeSection)} />
      <details className="rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer p-4 text-sm font-semibold text-slate-600">Or write a question just for this assessment</summary>
      {/* Add Question Button Banner - 5 Question Types */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f39223]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Questions to Assessment</h3>
              <p className="text-xs text-slate-500">Adding to {sectionLabel(activeSection)} · Choose a question format</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-semibold">
            {questions.length} Questions Created
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Add MCQ */}
          <button
            type="button"
            onClick={handleAddMCQ}
            className="p-3 rounded-xl bg-[#fff4e6] hover:bg-[#ffe8cc] border border-[#fcd8b3] text-[#c26d15] flex flex-col items-start gap-2 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Plus className="w-4 h-4" />
              <span>MCQ (Single)</span>
            </div>
            <span className="text-xs text-[#c26d15] font-medium">Single correct radio choice</span>
          </button>

          {/* Add MMCQ */}
          <button
            type="button"
            onClick={handleAddMMCQ}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 flex flex-col items-start gap-2 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Plus className="w-4 h-4" />
              <span>MMCQ (Multi)</span>
            </div>
            <span className="text-xs text-purple-700 font-medium">Multi-select checkboxes</span>
          </button>

          {/* Add Fill in Blanks */}
          <button
            type="button"
            onClick={handleAddFillInBlanks}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex flex-col items-start gap-2 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Plus className="w-4 h-4" />
              <span>Fill in Blanks</span>
            </div>
            <span className="text-xs text-emerald-700 font-medium">Sentence slots & word bank</span>
          </button>

          {/* Add Match the Following */}
          <button
            type="button"
            onClick={handleAddMatchFollowing}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex flex-col items-start gap-2 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Plus className="w-4 h-4" />
              <span>Match Following</span>
            </div>
            <span className="text-xs text-amber-700 font-medium">Column A to Column B pairs</span>
          </button>

          {/* Add Step Ordering / Jumbled Steps */}
          <button
            type="button"
            onClick={handleAddStepOrdering}
            className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 flex flex-col items-start gap-2 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Plus className="w-4 h-4" />
              <span>Sequence Ordering</span>
            </div>
            <span className="text-xs text-indigo-700 font-medium">Paragraphs, steps & events</span>
          </button>
        </div>
      </div>

      </details>

      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-5 items-start">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 xl:sticky xl:top-4">
          <div className="flex items-center justify-between px-2 py-3"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sections</h4><button onClick={addSection} className="text-xs font-semibold text-[#f39223] hover:text-[#e08217] flex items-center gap-1"><Plus size={14} /> Add section</button></div>
          <p className="px-2 pb-3 text-xs text-slate-500">Drag a question near a position. The orange guide snaps to where it will land.</p>
          <div role="status" className="mb-3 rounded-lg bg-[#fff4e6] border border-[#fcd8b3] px-3 py-2 text-xs font-medium text-[#c26d15]">{!draggedQuestionId ? 'Grab a question and drag it to an orange drop guide.' : dropTarget ? `Release to place in ${sectionLabel(sections.find(section => section.id === dropTarget.sectionId)!)}` : 'Drag to a section. Follow the orange insertion guide.'}</div>
          <div className="space-y-3 xl:max-h-[65vh] overflow-y-auto p-1"
            onDragOver={event => {
              if (!draggedQuestionId) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              if (event.clientY < bounds.top + 45) event.currentTarget.scrollTop -= 12;
              else if (event.clientY > bounds.bottom - 45) event.currentTarget.scrollTop += 12;
            }}>
            {sections.map(section => {
              const items = orderedQuestions.filter(q => sectionIdFor(q, sections) === section.id);
              return <div key={section.id} data-section-id={section.id}
                onDragOver={event => { if (draggedQuestionId) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; const target = getDropTarget(event, section.id); setDropTarget(prev => prev?.sectionId === target.sectionId && prev?.beforeId === target.beforeId ? prev : target); } }}
                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null); }}
                onDrop={event => { event.preventDefault(); if (draggedQuestionId) { const target = getDropTarget(event, section.id); moveToSection(draggedQuestionId, target.sectionId, target.beforeId); } }}
                className={`rounded-xl border p-2 transition-colors ${dropSectionId === section.id ? 'border-[#f39223] bg-[#fff4e6] ring-2 ring-[#fcd8b3]' : activeSection.id === section.id ? 'border-[#fcd8b3] bg-[#fff4e6]/40' : 'border-slate-200'}`}>
                <button onClick={() => {setActiveSectionId(section.id); setSelectedQuestionId(null);}} aria-pressed={activeSection.id === section.id} className="w-full p-2 text-left">
                  <span className="block break-words text-sm font-bold text-slate-800">{sectionLabel(section)}</span>
                  <span className="text-xs text-slate-500">{items.length} questions · {items.reduce((sum, q) => sum + q.marks, 0)} marks</span>
                </button>
                {items.map(q => <div key={q.id} className="relative">
                  {dropTarget?.sectionId === section.id && dropTarget.beforeId === q.id && renderDropIndicator()}
                  <button key={q.id} data-question-id={q.id} draggable aria-label={`Edit question ${orderedQuestions.indexOf(q) + 1}: ${q.prompt}`} onClick={() => selectQuestion(q.id)} aria-pressed={selectedId === q.id}
                  onDragStart={event => { setDraggedQuestionId(q.id); setDropTarget(null); event.dataTransfer.setData('text/plain', q.id); event.dataTransfer.effectAllowed = 'move'; }}
                  onDragEnd={() => {setDraggedQuestionId(null); setDropTarget(null);}}
                  className={`w-full flex gap-2 rounded-lg p-2.5 text-left cursor-grab active:cursor-grabbing ${draggedQuestionId === q.id ? 'opacity-30 ring-1 ring-dashed ring-[#fcd8b3] bg-[#fff4e6]' : ''} ${selectedId === q.id ? 'bg-white ring-1 ring-[#fcd8b3] shadow-xs' : 'hover:bg-slate-100'}`}>
                  <GripVertical size={14} className="shrink-0 text-slate-400 mt-1" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800">{orderedQuestions.indexOf(q) + 1}. {q.prompt || 'Untitled question'}</span><span className="text-xs text-slate-500">{typeLabels[q.type] || q.type} · {q.bloomsTaxonomy || 'Apply'} · {q.marks} marks</span></span>
                </button></div>)}
                <div data-drop-area="true" className={`relative mt-2 rounded-lg border-2 border-dashed px-2 py-4 text-center text-xs transition-colors ${dropSectionId === section.id && !dropTarget?.beforeId ? 'border-[#f39223] bg-[#fff4e6] text-[#c26d15]' : 'border-slate-300 bg-white/60 text-slate-500'}`}>
                  {dropSectionId === section.id && !dropTarget?.beforeId && renderDropIndicator()}
                  <span className="pointer-events-none">{dropSectionId === section.id && !dropTarget?.beforeId ? 'Release to drop here' : items.length ? 'Drop at end of section' : 'Drop into this section'}</span>
                </div>
              </div>;
            })}
          </div>
        </aside>
      <div className="min-w-0 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2"><h4 className="text-sm font-bold">Section settings</h4><button disabled={sections.length === 1} onClick={() => removeSection(activeSection.id)} title="Questions will move to the first remaining section" className="text-xs text-red-600 disabled:text-slate-400 disabled:cursor-not-allowed">Remove section</button></div>
          <div><label htmlFor="section-title" className="block text-xs font-semibold text-slate-600 mb-1">Section title <span className="font-normal text-slate-400">(optional)</span></label><input id="section-title" value={activeSection.title || ''} placeholder={sectionLabel({ ...activeSection, title: '' })} onChange={event => setSections(prev => prev.map(section => section.id === activeSection.id ? { ...section, title: event.target.value } : section))} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39223]" /></div>
          <div><label htmlFor="section-description" className="block text-xs font-semibold text-slate-600 mb-1">Section description <span className="font-normal text-slate-400">(optional)</span></label><textarea id="section-description" rows={2} value={activeSection.description || ''} placeholder="Add context or instructions for this section…" onChange={event => setSections(prev => prev.map(section => section.id === activeSection.id ? { ...section, description: event.target.value } : section))} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39223]" /></div>
          <p className="text-xs text-slate-500">At least one section is required. Removing a section moves its questions to the first remaining section.</p>
        </div>
        <p role="status" className="sr-only">{sectionAnnouncement}</p>
        {!sectionQuestions.length && <div className="rounded-2xl border border-dashed border-[#fcd8b3] bg-[#fff4e6] p-8 text-center"><h4 className="font-semibold text-slate-800">Your section is ready for questions</h4><p className="mt-2 text-sm text-slate-500">Search the question pool above and add selected questions to this section. You can also move questions between sections.</p></div>}
        {orderedQuestions.map((q, idx) => q.id === selectedId && (
          <div
            key={q.id}
            className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-slate-900"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs"><label htmlFor="question-section" className="font-semibold text-slate-600">Move to section</label><select id="question-section" value={sectionIdFor(q, sections)} onChange={event => moveToSection(q.id, event.target.value)} className="max-w-full rounded-lg border border-slate-300 p-2 bg-white">{sections.map(section => <option key={section.id} value={section.id}>{sectionLabel(section)}</option>)}</select></div>
            {/* Question Card Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-7 h-7 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                  {idx + 1}
                </span>

                {/* Question Type Tag */}
                {q.type === 'mcq' && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#fff4e6] text-[#c26d15] border border-[#fcd8b3] text-xs font-extrabold">
                    MCQ (Single Choice)
                  </span>
                )}
                {q.type === 'mmcq' && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 text-xs font-extrabold">
                    MMCQ (Multiple Correct)
                  </span>
                )}
                {q.type === 'fill_in_blanks' && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                    Fill in the Blanks
                  </span>
                )}
                {q.type === 'match_following' && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold">
                    Match the Following
                  </span>
                )}
                {q.type === 'step_ordering' && (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-extrabold flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    Sequence & Step Ordering
                  </span>
                )}

                {/* Bloom's Taxonomy Badge & Selector */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Bloom:</span>
                  <select
                    aria-label="Bloom's Taxonomy level"
                    value={q.bloomsTaxonomy || 'Apply'}
                    onChange={(e) =>
                      handleUpdateQuestion(q.id, { bloomsTaxonomy: e.target.value as BloomsTaxonomyLevel })
                    }
                    className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#f39223]"
                  >
                    {bloomsTaxonomyLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marks and Re-order / Delete actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Marks:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={q.marks}
                    onChange={(e) =>
                      handleUpdateQuestion(q.id, { marks: Number(e.target.value) || 1 })
                    }
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-black text-slate-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleMoveQuestion(q.id, 'up')}
                  disabled={sectionQuestions[0]?.id === q.id}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveQuestion(q.id, 'down')}
                  disabled={sectionQuestions.at(-1)?.id === q.id}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicateQuestion(q.id)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Duplicate Question"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Question Statement / Instructions Prompt
              </label>
              <textarea
                rows={2}
                aria-label="Question prompt"
              value={q.prompt}
                onChange={(e) => handleUpdateQuestion(q.id, { prompt: e.target.value })}
                placeholder="Enter question statement, instructions, or scenario description..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f39223]"
              />
            </div>

            {/* 1. MCQ BUILDER */}
            {q.type === 'mcq' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Multiple Choice Options (Select radio for correct answer)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddOption(q.id)}
                    className="text-xs text-[#f39223] font-bold hover:text-[#e08217] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = q.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                          isCorrect
                            ? 'bg-[#fff4e6] border-[#f39223] ring-1 ring-[#fcd8b3]'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={isCorrect}
                          onChange={() => handleUpdateQuestion(q.id, { correctOptionIndex: optIdx })}
                          className="w-4 h-4 accent-[#f39223]"
                        />
                        <span className="w-5 text-xs font-bold text-slate-500">
                          {String.fromCharCode(65 + optIdx)})
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...(q.options || [])];
                            copy[optIdx] = e.target.value;
                            handleUpdateQuestion(q.id, { options: copy });
                          }}
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(q.id, optIdx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. MMCQ BUILDER */}
            {q.type === 'mmcq' && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      Multi-Select Options (Check boxes for ALL correct answers)
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold block">
                      {q.correctOptionIndices?.length || 0} Correct options selected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddOption(q.id)}
                    className="text-xs text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Choice</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = q.correctOptionIndices?.includes(optIdx) || false;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                          isCorrect
                            ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-400'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCorrect}
                          onChange={() => handleToggleMMCQCorrect(q.id, optIdx)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="w-5 text-xs font-bold text-slate-500">
                          {String.fromCharCode(65 + optIdx)})
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...(q.options || [])];
                            copy[optIdx] = e.target.value;
                            handleUpdateQuestion(q.id, { options: copy });
                          }}
                          className="flex-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(q.id, optIdx)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. FILL IN THE BLANKS BUILDER */}
            {q.type === 'fill_in_blanks' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Blank Slots Manager (Prefix + Correct Drop Answer + Suffix)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddBlankSlot(q.id)}
                    className="text-xs text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Slot</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {q.blankSlots?.map((slot, sIdx) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-800">
                          {slot.label || `Blank #${sIdx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlankSlot(q.id, slot.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Prefix (Text before blank)
                          </label>
                          <input
                            type="text"
                            value={slot.sentencePrefix}
                            onChange={(e) => {
                              const updatedSlots = q.blankSlots?.map((s) =>
                                s.id === slot.id ? { ...s, sentencePrefix: e.target.value } : s
                              );
                              handleUpdateQuestion(q.id, { blankSlots: updatedSlots });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-emerald-800 mb-0.5">
                            ★ Correct Answer (Target)
                          </label>
                          <input
                            type="text"
                            value={slot.correctAnswer}
                            onChange={(e) => {
                              const updatedSlots = q.blankSlots?.map((s) =>
                                s.id === slot.id ? { ...s, correctAnswer: e.target.value } : s
                              );
                              handleUpdateQuestion(q.id, { blankSlots: updatedSlots });
                            }}
                            className="w-full px-2.5 py-1.5 bg-emerald-100 border border-emerald-400 rounded-lg text-xs font-bold text-emerald-950"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Suffix (Text after blank)
                          </label>
                          <input
                            type="text"
                            value={slot.sentenceSuffix || ''}
                            onChange={(e) => {
                              const updatedSlots = q.blankSlots?.map((s) =>
                                s.id === slot.id ? { ...s, sentenceSuffix: e.target.value } : s
                              );
                              handleUpdateQuestion(q.id, { blankSlots: updatedSlots });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Word Bank Pool Chips */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Word Bank Options (Comma-separated distractor pool for students)
                  </label>
                  <input
                    type="text"
                    value={q.blankOptions?.join(', ') || ''}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      handleUpdateQuestion(q.id, { blankOptions: list });
                    }}
                    placeholder="e.g. speed of light (c), perpendicular, parallel, wavelength, mgh"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* 4. MATCH THE FOLLOWING BUILDER */}
            {q.type === 'match_following' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Column A ➔ Column B Matching Pairs
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddMatchingPair(q.id)}
                    className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pair</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {q.matchingPairs?.map((pair, pIdx) => (
                    <div
                      key={pair.id}
                      className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200 flex items-center gap-3 text-xs"
                    >
                      <span className="font-extrabold text-amber-900 w-6">#{pIdx + 1}</span>

                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Column A (Left Item)
                        </label>
                        <input
                          type="text"
                          value={pair.leftText}
                          onChange={(e) => {
                            const updatedPairs = q.matchingPairs?.map((p) =>
                              p.id === pair.id ? { ...p, leftText: e.target.value } : p
                            );
                            handleUpdateQuestion(q.id, { matchingPairs: updatedPairs });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <span className="text-slate-400 font-black text-sm pt-4">➔</span>

                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                          Column B (Exact Matching Pair)
                        </label>
                        <input
                          type="text"
                          value={pair.rightText}
                          onChange={(e) => {
                            const updatedPairs = q.matchingPairs?.map((p) =>
                              p.id === pair.id ? { ...p, rightText: e.target.value } : p
                            );
                            handleUpdateQuestion(q.id, { matchingPairs: updatedPairs });
                          }}
                          className="w-full px-2.5 py-1.5 bg-amber-100 border border-amber-400 rounded-lg text-xs font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMatchingPair(q.id, pair.id)}
                        className="p-1 text-slate-400 hover:text-red-500 pt-4"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SEQUENCE & STEP ORDERING BUILDER (Universal for all subjects) */}
            {q.type === 'step_ordering' && (
              <div className="space-y-4 pt-2">
                {/* Correct Sequential Steps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ListOrdered className="w-4 h-4 text-indigo-600" />
                        Correct Sequence / Paragraph Order (#1 to #{q.orderedSteps?.length || 0})
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Enter the correct chronological/logical sequence (paragraphs, solution steps, scientific processes, historical timeline, algorithm steps, etc.)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddStepOrderingStep(q.id)}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Step / Paragraph</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {q.orderedSteps?.map((stepText, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-200 flex items-center gap-2.5 text-xs"
                      >
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          #{sIdx + 1}
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={stepText}
                            onChange={(e) =>
                              handleUpdateStepOrderingStep(q.id, sIdx, e.target.value)
                            }
                            placeholder={`Item / Step ${sIdx + 1}: Enter paragraph, sentence, step, or equation...`}
                            className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Step Move Up/Down and Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveStepOrderingStep(q.id, sIdx, 'up')}
                            disabled={sIdx === 0}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 text-slate-600"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveStepOrderingStep(q.id, sIdx, 'down')}
                            disabled={sIdx === (q.orderedSteps?.length || 0) - 1}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 text-slate-600"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveStepOrderingStep(q.id, sIdx)}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="Delete Item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distractor (Incorrect / Confusing Steps) */}
                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Distractor / False Choices (Optional — to test & challenge students)
                      </span>
                      <p className="text-[10px] text-amber-800/80">
                        Students must identify and avoid selecting these wrong steps, false paragraphs, or irrelevant events.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddDistractorStep(q.id)}
                      className="text-xs text-amber-800 font-bold hover:text-amber-900 flex items-center gap-1 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Distractor</span>
                    </button>
                  </div>

                  {(!q.distractorSteps || q.distractorSteps.length === 0) ? (
                    <p className="text-xs text-amber-700 italic bg-white/70 p-2.5 rounded-xl border border-amber-200">
                      No distractors added yet. Click "+ Add Distractor" to add wrong choices or false paragraphs.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {q.distractorSteps.map((distText, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center gap-2 text-xs"
                        >
                          <span className="font-extrabold text-amber-700 px-2 py-0.5 bg-amber-100 rounded text-[10px] shrink-0">
                            Distractor #{dIdx + 1}
                          </span>

                          <input
                            type="text"
                            value={distText}
                            onChange={(e) =>
                              handleUpdateDistractorStep(q.id, dIdx, e.target.value)
                            }
                            placeholder="Enter distractor step, irrelevant paragraph, or false conclusion..."
                            className="flex-1 px-2.5 py-1 bg-amber-50/40 border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveDistractorStep(q.id, dIdx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Explanation / Model Note */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Solution Explanation / Concept Note (Shown to student after quiz is published)
              </label>
              <input
                type="text"
                value={q.explanation || ''}
                onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                placeholder="Explain the step-by-step reasoning or mathematical theorem..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f39223]"
              />
            </div>
          </div>
        ))}
      </div>

      </div>
      </>}

      {step === 2 && <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <h4 className="text-base font-bold text-slate-900">Timing & grading</h4>
          <div className="grid sm:grid-cols-2 gap-4">
          {/* Timer Duration Limit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Timer Limit</label>
            <select
              aria-label="Timer limit"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
            >
              <option value={60}>1 Minute (Lightning Poll)</option>
              <option value={120}>2 Minutes (Quick Check)</option>
              <option value={180}>3 Minutes (Standard Spot Quiz)</option>
              <option value={300}>5 Minutes (Extended Review)</option>
              <option value={600}>10 Minutes (In-Depth Assessment)</option>
              <option value={0}>Untimed (Teacher controls closure)</option>
            </select>
          </div>

          {/* Passing Marks */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Pass Mark Cutoff</label>
            <input
              type="number"
              min={1}
              max={totalCalculatedMarks}
              aria-label="Pass mark cutoff"
              value={passMarks}
              onChange={(e) => setPassMarks(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
            />
          </div>
          </div>
          <div>
            <label htmlFor="assessment-instructions" className="block text-sm font-semibold text-slate-800 mb-2">Student instructions</label>
            <textarea id="assessment-instructions" value={instructions} onChange={e => setInstructions(e.target.value)} rows={4}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f39223]" />
          </div>
          <div className="border-t border-slate-100 pt-5">
            <div className="flex justify-between items-center mb-3"><h4 className="font-bold text-sm">Question summary</h4><button onClick={() => goToStep(1)} className="text-sm font-semibold text-[#f39223] hover:text-[#e08217]">Edit questions</button></div>
            {orderedQuestions.map((q, index) => <button key={q.id} onClick={() => {selectQuestion(q.id); goToStep(1);}} className="w-full flex items-center gap-3 py-3 border-b border-slate-100 text-left hover:bg-slate-50">
              <span className="text-xs text-slate-400">{index + 1}.</span><span className="flex-1 min-w-0"><span className="block truncate text-sm font-medium">{q.prompt || 'Untitled question'}</span><span className="text-xs text-slate-500">{sectionLabel(sections.find(section => section.id === sectionIdFor(q, sections))!)} · {typeLabels[q.type] || q.type} · Bloom: {q.bloomsTaxonomy || 'Apply'}</span></span><span className="text-xs whitespace-nowrap text-slate-500">{q.marks} marks</span>
            </button>)}
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#f39223]">Assessment overview</span>
          <h4 className="text-lg font-bold break-words">{title || 'Untitled assessment'}</h4>
          <p className="text-sm text-slate-500">{subject} · {topic}</p>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-slate-500">Audience</dt><dd className="font-semibold mt-1">{targetClass}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Duration</dt><dd>{durationSeconds ? `${durationSeconds / 60} minutes` : 'Untimed'}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Passing score</dt><dd>{passMarks} / {totalCalculatedMarks}</dd></div>
          </dl>
          <button onClick={() => goToStep(0)} className="text-sm font-semibold text-[#f39223] hover:text-[#e08217]">Edit details</button>
          <button onClick={() => setShowPreviewModal(true)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"><Eye className="w-4 h-4" /> Student Preview</button>
          <p className="text-xs leading-relaxed text-slate-500">Save to your library for later, or share directly in a live class. Save a draft if you are still working.</p>
        </aside>
      </div>}

      {/* Bottom Save & Launch Floating Bar */}
      <div className="sticky bottom-0 z-10 p-4 bg-white/95 dark:bg-[#1a2130]/95 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-slate-100">{questions.length} Questions</span>
          <span>•</span>
          <span className="font-bold text-[#f39223]">{totalCalculatedMarks} Total Marks</span>
          <span>•</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {durationSeconds > 0 ? `${Math.floor(durationSeconds / 60)} Mins` : 'Untimed'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => step > 0 ? goToStep(step - 1) : setActiveTab('online-class-assessments')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
          >
            {step > 0 ? 'Back' : 'Cancel'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => goToStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#f39223] hover:bg-[#e08217] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5"
            >
              <span>{step === 0 ? 'Continue to questions' : 'Continue to review'}</span>
              <span>→</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSaveToBank(false)}
                className="px-5 py-2.5 bg-[#f39223] hover:bg-[#e08217] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Assessment</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndLaunchLive}
                className="px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Save & Share in Live Class</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Student Interactive Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f39223] rounded-xl shadow-md">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{title || 'Assessment Preview'}</h3>
                  <p className="text-xs text-slate-300">
                    {subject} • {totalCalculatedMarks} Marks • {questions.length} Questions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {orderedQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  {(idx === 0 || sectionIdFor(orderedQuestions[idx - 1], sections) !== sectionIdFor(q, sections)) && <div className="border-b border-slate-200 pb-4"><h4 className="font-bold text-base">{sectionLabel(sections.find(section => section.id === sectionIdFor(q, sections))!)}</h4><p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{sections.find(section => section.id === sectionIdFor(q, sections))?.description}</p></div>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">Question {idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#fff4e6] text-[#c26d15] border border-[#fcd8b3]">
                        {typeLabels[q.type] || q.type}
                      </span>
                      {q.bloomsTaxonomy && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${bloomsTaxonomyColors[q.bloomsTaxonomy]?.bg || 'bg-purple-100'} ${bloomsTaxonomyColors[q.bloomsTaxonomy]?.text || 'text-purple-800'} ${bloomsTaxonomyColors[q.bloomsTaxonomy]?.border || 'border-purple-200'}`}>
                          {q.bloomsTaxonomy}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                      {q.marks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{q.prompt}</p>

                  {/* MCQ Preview */}
                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:border-[#f39223] text-xs font-medium text-slate-800"
                        >
                          <input type="radio" name={`prev-q-${q.id}`} className="w-4 h-4 accent-[#f39223]" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* MMCQ Preview */}
                  {q.type === 'mmcq' && q.options && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">
                        ☑️ Multi-select checkboxes:
                      </span>
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:border-purple-400 text-xs font-medium text-slate-800"
                        >
                          <input type="checkbox" className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Blanks Preview */}
                  {q.type === 'fill_in_blanks' && q.blankSlots && (
                    <div className="space-y-2">
                      {q.blankSlots.map((slot) => (
                        <div key={slot.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-800">{slot.sentencePrefix}</span>
                          <input
                            type="text"
                            placeholder={`[${slot.label}]`}
                            className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 w-36 text-center"
                          />
                          {slot.sentenceSuffix && (
                            <span className="font-medium text-slate-800">{slot.sentenceSuffix}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Match Preview */}
                  {q.type === 'match_following' && q.matchingPairs && (
                    <div className="space-y-2">
                      {q.matchingPairs.map((pair, pIdx) => (
                        <div
                          key={pIdx}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white rounded-xl border border-slate-200 items-center text-xs"
                        >
                          <span className="font-bold text-slate-800 px-2">{pair.leftText}</span>
                          <select className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]">
                            <option value="">Select Matching Option...</option>
                            {q.matchingPairs?.map((m) => (
                              <option key={m.id} value={m.rightText}>
                                {m.rightText}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step Ordering Preview */}
                  {q.type === 'step_ordering' && q.orderedSteps && (
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-900 block">
                          📝 Arrange Solution Steps in Logical Order:
                        </span>
                        <div className="space-y-1.5">
                          {q.orderedSteps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs text-slate-800"
                            >
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                {sIdx + 1}
                              </span>
                              <span className="font-medium">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {q.distractorSteps && q.distractorSteps.length > 0 && (
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                          <span className="font-bold text-amber-900 block mb-1">
                            ⚠️ Distractor Steps (Mixed into pool to challenge students):
                          </span>
                          <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5">
                            {q.distractorSteps.map((d, dIdx) => (
                              <li key={dIdx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex items-center justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold shadow-sm cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageWrapper>
  );
};
