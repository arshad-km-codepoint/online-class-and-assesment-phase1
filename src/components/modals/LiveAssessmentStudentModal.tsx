import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Zap,
  HelpCircle,
  Check,
  AlertTriangle,
  FileText,
  X,
  Volume2,
  Video,
  GripVertical,
  Link2,
  Unlink2,
  MousePointerClick,
  RefreshCw,
  ListOrdered,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { LiveAssessmentSubmission, LiveStudentAnswer } from '../../types';

// Color themes for matched pairs to visually connect Column A & Column B
const PAIR_COLORS = [
  {
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    cardBg: 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400/50',
    accentText: 'text-purple-700',
    dotBg: 'bg-purple-500',
    border: 'border-purple-300',
  },
  {
    badgeBg: 'bg-[#fff4e6] text-[#c26d15] border-[#fcd8b3]',
    cardBg: 'bg-[#fff4e6]/80 border-[#fcd8b3] ring-1 ring-[#f39223]/30',
    accentText: 'text-[#c26d15]',
    dotBg: 'bg-[#f39223]',
    border: 'border-[#fcd8b3]',
  },
  {
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cardBg: 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/50',
    accentText: 'text-emerald-700',
    dotBg: 'bg-emerald-500',
    border: 'border-emerald-300',
  },
  {
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    cardBg: 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/50',
    accentText: 'text-amber-700',
    dotBg: 'bg-amber-500',
    border: 'border-amber-300',
  },
  {
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    cardBg: 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/50',
    accentText: 'text-rose-700',
    dotBg: 'bg-rose-500',
    border: 'border-rose-300',
  },
];

export const LiveAssessmentStudentModal: React.FC = () => {
  const { showStudentAssessmentModal, activeLiveAssessment } = useExam();
  if (!showStudentAssessmentModal || !activeLiveAssessment) return null;
  return <LiveAssessmentStudentModalContent key={activeLiveAssessment.id} assessment={activeLiveAssessment}/>;
};

const LiveAssessmentStudentModalContent: React.FC<{ assessment: NonNullable<ReturnType<typeof useExam>["activeLiveAssessment"]> }> = ({ assessment }) => {
  const {
    showStudentAssessmentModal,
    setShowStudentAssessmentModal,
    submitLiveStudentAssessment,
    selectedChild,
    addToast,
  } = useExam();
  const activeLiveAssessment = assessment;



  const [timeRemaining, setTimeRemaining] = useState<number>(
    activeLiveAssessment.durationSeconds || 180
  );
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | undefined>(undefined);
  const [selectedMmcqOptions, setSelectedMmcqOptions] = useState<number[]>([]);

  const toggleMmcqOption = (idx: number) => {
    setSelectedMmcqOptions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Match the Following State (Q2)
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Fill in the Blanks State (Q3)
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [selectedBlankOption, setSelectedBlankOption] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{
    source: 'left' | 'right' | 'blank_option' | 'blank_slot';
    text: string;
    label?: string;
    slotId?: string;
  } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{
    target: 'left' | 'right' | 'blank_slot';
    text: string;
  } | null>(null);

  // Short Answer State (Q4)
  const [shortAnswerText, setShortAnswerText] = useState<string>('');

  // Step Ordering & Sequential Proof State (Q5)
  const [placedSolutionSteps, setPlacedSolutionSteps] = useState<string[]>([]);

  const handleAddSolutionStep = (stepText: string) => {
    if (!placedSolutionSteps.includes(stepText)) {
      setPlacedSolutionSteps((prev) => [...prev, stepText]);
    }
  };

  const handleRemoveSolutionStep = (stepIdx: number) => {
    setPlacedSolutionSteps((prev) => prev.filter((_, idx) => idx !== stepIdx));
  };

  const handleMoveSolutionStep = (stepIdx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && stepIdx === 0) ||
      (direction === 'down' && stepIdx === placedSolutionSteps.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? stepIdx - 1 : stepIdx + 1;
    const copy = [...placedSolutionSteps];
    const item = copy.splice(stepIdx, 1)[0];
    copy.splice(targetIdx, 0, item);
    setPlacedSolutionSteps(copy);
  };

  const handleResetSolutionSteps = () => {
    setPlacedSolutionSteps([]);
  };

  // Submission result state
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [finalSubmission, setFinalSubmission] = useState<LiveAssessmentSubmission | null>(null);

  // Timer countdown
  useEffect(() => {
    if (hasSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasSubmitted]);

  // Match the Following matching logic - Click based
  const handleLeftClick = (leftText: string) => {
    if (selectedLeftId === leftText) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(leftText);
    }
  };

  const handleRightClick = (rightText: string) => {
    if (!selectedLeftId) {
      addToast('Select Left Item First', 'Click an item in Column A (or drag & drop), then click Column B.', 'info');
      return;
    }
    setMatchedPairs((prev) => ({
      ...prev,
      [selectedLeftId]: rightText,
    }));
    setSelectedLeftId(null);
  };

  const removeMatch = (leftText: string) => {
    setMatchedPairs((prev) => {
      const copy = { ...prev };
      delete copy[leftText];
      return copy;
    });
  };

  const resetAllMatches = () => {
    setMatchedPairs({});
    setSelectedLeftId(null);
  };

  // Fill in the Blanks matching logic
  const handleBlankSlotClick = (slotId: string) => {
    if (selectedBlankOption) {
      setBlankAnswers((prev) => ({
        ...prev,
        [slotId]: selectedBlankOption,
      }));
      setSelectedBlankOption(null);
    }
  };

  const removeBlankAnswer = (slotId: string) => {
    setBlankAnswers((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  const resetAllBlanks = () => {
    setBlankAnswers({});
    setSelectedBlankOption(null);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (
    e: React.DragEvent,
    source: 'left' | 'right' | 'blank_option' | 'blank_slot',
    text: string,
    label?: string,
    slotId?: string
  ) => {
    setDraggedItem({ source, text, label, slotId });
    e.dataTransfer.setData('text/plain', JSON.stringify({ source, text, label, slotId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, target: 'left' | 'right' | 'blank_slot', text: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTarget || dragOverTarget.text !== text || dragOverTarget.target !== target) {
      setDragOverTarget({ target, text });
    }
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDropOnRight = (e: React.DragEvent, rightText: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedItem) return;

    if (draggedItem.source === 'left') {
      setMatchedPairs((prev) => ({
        ...prev,
        [draggedItem.text]: rightText,
      }));
      setDraggedItem(null);
      setSelectedLeftId(null);
    }
  };

  const handleDropOnLeft = (e: React.DragEvent, leftText: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedItem) return;

    if (draggedItem.source === 'right') {
      setMatchedPairs((prev) => ({
        ...prev,
        [leftText]: draggedItem.text,
      }));
      setDraggedItem(null);
      setSelectedLeftId(null);
    }
  };

  const handleDropOnBlankSlot = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    if (!draggedItem) return;

    if (draggedItem.source === 'blank_option' || draggedItem.source === 'blank_slot') {
      // If moving from another slot, remove it from that slot first
      if (draggedItem.slotId && draggedItem.slotId !== slotId) {
        removeBlankAnswer(draggedItem.slotId);
      }
      setBlankAnswers((prev) => ({
        ...prev,
        [slotId]: draggedItem.text,
      }));
      setDraggedItem(null);
      setSelectedBlankOption(null);
    }
  };

  // Helper to get color style for a pair index
  const getPairColor = (leftText: string, allLeftKeys: string[]) => {
    const idx = allLeftKeys.indexOf(leftText);
    return PAIR_COLORS[idx % PAIR_COLORS.length] || PAIR_COLORS[0];
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    let calculatedScore = 0;
    const answersRecord: Record<string, LiveStudentAnswer> = {};

    activeLiveAssessment.questions.forEach((q) => {
      if (q.type === 'mcq') {
        const isCorrect = selectedMcqOption === q.correctOptionIndex;
        const awarded = isCorrect ? q.marks : 0;
        calculatedScore += awarded;
        answersRecord[q.id] = {
          questionId: q.id,
          selectedOptionIndex: selectedMcqOption,
          isAutoCorrect: isCorrect,
          scoreAwarded: awarded,
        };
      } else if (q.type === 'mmcq') {
        const correctIndices = q.correctOptionIndices || [];
        const isFullyCorrect =
          correctIndices.length > 0 &&
          correctIndices.every((idx) => selectedMmcqOptions.includes(idx)) &&
          selectedMmcqOptions.every((idx) => correctIndices.includes(idx));

        let score = 0;
        if (isFullyCorrect) {
          score = q.marks;
        } else {
          const correctSelected = selectedMmcqOptions.filter((idx) => correctIndices.includes(idx)).length;
          const incorrectSelected = selectedMmcqOptions.filter((idx) => !correctIndices.includes(idx)).length;
          if (incorrectSelected === 0 && correctSelected > 0) {
            score = parseFloat(((correctSelected / correctIndices.length) * q.marks).toFixed(1));
          }
        }
        calculatedScore += score;
        answersRecord[q.id] = {
          questionId: q.id,
          selectedOptionIndices: selectedMmcqOptions,
          isAutoCorrect: isFullyCorrect,
          scoreAwarded: score,
        };
      } else if (q.type === 'match_following') {
        let correctMatchesCount = 0;
        const totalPairs = q.matchingPairs?.length || 1;
        q.matchingPairs?.forEach((pair) => {
          if (matchedPairs[pair.leftText] === pair.rightText) {
            correctMatchesCount++;
          }
        });
        const matchScore = parseFloat(((correctMatchesCount / totalPairs) * q.marks).toFixed(1));
        calculatedScore += matchScore;
        answersRecord[q.id] = {
          questionId: q.id,
          matchedPairs: matchedPairs,
          isAutoCorrect: correctMatchesCount === totalPairs,
          scoreAwarded: matchScore,
        };
      } else if (q.type === 'fill_in_blanks') {
        let correctBlanksCount = 0;
        const totalSlots = q.blankSlots?.length || 1;
        q.blankSlots?.forEach((slot) => {
          if (blankAnswers[slot.id] === slot.correctAnswer) {
            correctBlanksCount++;
          }
        });
        const blankScore = parseFloat(((correctBlanksCount / totalSlots) * q.marks).toFixed(1));
        calculatedScore += blankScore;
        answersRecord[q.id] = {
          questionId: q.id,
          blankAnswers: blankAnswers,
          isAutoCorrect: correctBlanksCount === totalSlots,
          scoreAwarded: blankScore,
        };
      } else if (q.type === 'step_ordering') {
        const correctSteps = q.orderedSteps || [];
        const studentPlaced = placedSolutionSteps;
        const isLengthEqual = studentPlaced.length === correctSteps.length;
        const isExactMatch =
          isLengthEqual && studentPlaced.every((s, sIdx) => s === correctSteps[sIdx]);

        let stepScore = 0;
        if (isExactMatch) {
          stepScore = q.marks;
        } else {
          let correctPrefixCount = 0;
          for (let i = 0; i < studentPlaced.length; i++) {
            if (i < correctSteps.length && studentPlaced[i] === correctSteps[i]) {
              correctPrefixCount++;
            } else {
              break;
            }
          }
          if (correctPrefixCount > 0 && correctSteps.length > 0) {
            stepScore = parseFloat(((correctPrefixCount / correctSteps.length) * q.marks).toFixed(1));
          }
        }
        calculatedScore += stepScore;
        answersRecord[q.id] = {
          questionId: q.id,
          placedSteps: studentPlaced,
          isAutoCorrect: isExactMatch,
          scoreAwarded: stepScore,
        };
      } else if (q.type === 'short_answer') {
        const lower = shortAnswerText.toLowerCase();
        let keywordMatches = 0;
        q.keywords?.forEach((kw) => {
          if (lower.includes(kw.toLowerCase())) keywordMatches++;
        });
        const shortScore = shortAnswerText.trim().length > 10 ? (keywordMatches > 0 ? q.marks : q.marks - 0.5) : 0;
        calculatedScore += shortScore;
        answersRecord[q.id] = {
          questionId: q.id,
          textAnswer: shortAnswerText,
          scoreAwarded: shortScore,
        };
      }
    });

    const subId = 'sub-live-' + Date.now();
    const submissionObj: LiveAssessmentSubmission = {
      id: subId,
      assessmentId: activeLiveAssessment.id,
      studentId: selectedChild?.id || 's-1',
      studentName: selectedChild?.name || 'Aarav Sharma',
      rollNo: selectedChild?.rollNo || '1001',
      avatar:
        selectedChild?.avatar ||
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      answers: answersRecord,
      totalScore: calculatedScore,
      maxMarks: activeLiveAssessment.totalMarks,
      percentage: Math.round((calculatedScore / activeLiveAssessment.totalMarks) * 100),
      status: 'submitted',
    };

    submitLiveStudentAssessment(submissionObj);
    setFinalSubmission(submissionObj);
    setHasSubmitted(true);
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const mcqQuestion = activeLiveAssessment.questions.find((q) => q.type === 'mcq');
  const mmcqQuestion = activeLiveAssessment.questions.find((q) => q.type === 'mmcq');
  const matchQuestion = activeLiveAssessment.questions.find((q) => q.type === 'match_following');
  const fillBlanksQuestion = activeLiveAssessment.questions.find((q) => q.type === 'fill_in_blanks');
  const stepQuestion = activeLiveAssessment.questions.find((q) => q.type === 'step_ordering');
  const shortQuestion = activeLiveAssessment.questions.find((q) => q.type === 'short_answer');

  // Ordered column lists for Match the Following
  const matchPairs = matchQuestion?.matchingPairs || [];
  const columnALeftTexts = matchPairs.map((p) => p.leftText);
  const columnBRightOptions = [
    matchPairs[2]?.rightText || 'sec²(x)',
    matchPairs[0]?.rightText || '2 · e^(2x)',
    matchPairs[3]?.rightText || '3x² - 4',
    matchPairs[1]?.rightText || '1 / x  (for x > 0)',
  ];

  // Fill in the Blanks data
  const blankSlots = fillBlanksQuestion?.blankSlots || [];
  const blankOptions = fillBlanksQuestion?.blankOptions || [];

  // Step Ordering available steps pool (shuffled)
  const allAvailableSteps = React.useMemo(() => {
    if (!stepQuestion) return [];
    const combined = [
      ...(stepQuestion.orderedSteps || []),
      ...(stepQuestion.distractorSteps || []),
    ];
    return combined;
  }, [stepQuestion]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        {/* Modal Top Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f39223] rounded-xl shadow-md">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f39223]/20 text-[#f39223] border border-[#f39223]/30">
                  Live Class Assessment
                </span>
                <span className="text-xs font-semibold text-slate-300">{activeLiveAssessment.subject}</span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white">{activeLiveAssessment.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Timer Badge */}
            {!hasSubmitted && (
              <div
                className={`px-3 py-1 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border shadow-xs ${
                  timeRemaining < 30
                    ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse'
                    : 'bg-white/10 text-white border-white/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{timeFormatted}</span>
              </div>
            )}

            <button
              onClick={() => setShowStudentAssessmentModal(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Assessment Taking Area or Post-Submission Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {hasSubmitted && finalSubmission ? (
            /* Submission Results & Immediate Score Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">Assessment Submitted Successfully!</h3>
                <p className="text-xs text-slate-500">
                  Your live responses have been submitted to <b>Prof. Sarah Jenkins</b> in real-time.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="p-5 bg-linear-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl border border-emerald-200/80 max-w-md mx-auto space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Instant Auto-Scored Results
                </span>
                <p className="text-3xl font-black text-emerald-700">
                  {finalSubmission.totalScore} / {finalSubmission.maxMarks} Marks
                </p>
                <p className="text-xs font-semibold text-emerald-600">
                  Accuracy: {finalSubmission.percentage}% • Fast Submission
                </p>
              </div>

              {/* Review of Question Keys */}
              <div className="text-left space-y-3 pt-4 border-t border-slate-100 max-w-xl mx-auto">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Solution Breakdown:
                </h4>

                {/* Question 1 Solution */}
                {mcqQuestion && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Q1. MCQ Derivative</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          finalSubmission.answers[mcqQuestion.id]?.isAutoCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {finalSubmission.answers[mcqQuestion.id]?.isAutoCorrect ? '✓ Correct (+3 Marks)' : '✗ Incorrect (0 Marks)'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{mcqQuestion.explanation}</p>
                  </div>
                )}

                {/* Question 2 Solution */}
                {matchQuestion && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Q2. Match the Following Solutions</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {finalSubmission.answers[matchQuestion.id]?.scoreAwarded} / {matchQuestion.marks} Marks
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {matchQuestion.matchingPairs?.map((pair) => {
                        const studentMatchedRight = finalSubmission.answers[matchQuestion.id]?.matchedPairs?.[pair.leftText];
                        const isCorrect = studentMatchedRight === pair.rightText;
                        return (
                          <div
                            key={pair.id}
                            className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                              isCorrect ? 'bg-emerald-50/80 border-emerald-300' : 'bg-red-50/80 border-red-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{pair.leftText}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border">
                                {isCorrect ? '✓ Matched' : '✗ Mis-paired'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                              <span>Correct:</span>
                              <span className="font-bold text-emerald-700">{pair.rightText}</span>
                              {!isCorrect && studentMatchedRight && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <span>You:</span>
                                  <span className="font-semibold text-red-600 line-through">{studentMatchedRight}</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 3 Solution: Fill in the Blanks */}
                {fillBlanksQuestion && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Q3. Fill in the Blanks Solutions</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {finalSubmission.answers[fillBlanksQuestion.id]?.scoreAwarded} / {fillBlanksQuestion.marks} Marks
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      {fillBlanksQuestion.blankSlots?.map((slot) => {
                        const studentAnswer = finalSubmission.answers[fillBlanksQuestion.id]?.blankAnswers?.[slot.id];
                        const isCorrect = studentAnswer === slot.correctAnswer;
                        return (
                          <div
                            key={slot.id}
                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                              isCorrect ? 'bg-emerald-50/80 border-emerald-300' : 'bg-red-50/80 border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-700">{slot.sentencePrefix}</span>
                              <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                                isCorrect ? 'bg-emerald-200/80 text-emerald-900' : 'bg-red-200/80 text-red-900 line-through'
                              }`}>
                                {studentAnswer || '[Empty]'}
                              </span>
                              {!isCorrect && (
                                <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                                  ✓ {slot.correctAnswer}
                                </span>
                              )}
                              {slot.sentenceSuffix && (
                                <span className="font-semibold text-slate-700">{slot.sentenceSuffix}</span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question 4 Solution: Short Answer */}
                {shortQuestion && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Q4. Conceptual Answer</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {finalSubmission.answers[shortQuestion.id]?.scoreAwarded} / {shortQuestion.marks} Marks
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      <b>Sample Answer:</b> {shortQuestion.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setShowStudentAssessmentModal(false)}
                  className="px-6 py-2.5 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Return to Live Classroom Stream
                </button>
              </div>
            </div>
          ) : (
            /* Assessment Question-Taking View */
            <div className="space-y-8">
              {/* Question 1: Multiple Choice Question */}
              {mcqQuestion && (
                <div className="space-y-3 p-5 bg-slate-50/70 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-[#f39223] tracking-wider">
                      Question 1 • Single Choice ({mcqQuestion.marks} Marks)
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Calculus Chain Rule</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{mcqQuestion.prompt}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {mcqQuestion.options?.map((opt, idx) => {
                      const isSelected = selectedMcqOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMcqOption(idx)}
                          className={`p-3.5 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#f39223] text-white border-[#f39223] shadow-sm'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-[#f39223] hover:bg-[#fff4e6]/40'
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-white bg-white text-[#f39223]' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multiple Choice Question (Multiple Correct - MMCQ) */}
              {mmcqQuestion && (
                <div className="space-y-3 p-5 bg-slate-50/70 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-purple-600 tracking-wider">
                      MMCQ • Multiple Choices ({mmcqQuestion.marks} Marks)
                    </span>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-300">
                      ☑️ Select all that apply
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{mmcqQuestion.prompt}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {mmcqQuestion.options?.map((opt, idx) => {
                      const isSelected = selectedMmcqOptions.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleMmcqOption(idx)}
                          className={`p-3.5 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40'
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'border-white bg-white text-purple-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 2: Interactive Drag & Drop Match the Following with Blank Drop Targets */}
              {matchQuestion && (
                <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-xs">
                  {/* Question Header & Action bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-purple-600 tracking-wider">
                        Question 2 • Match the Following ({matchQuestion.marks} Marks)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Drag to Blank Slot
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {Object.keys(matchedPairs).length} / {matchPairs.length} Slots Filled
                      </span>
                      {Object.keys(matchedPairs).length > 0 && (
                        <button
                          type="button"
                          onClick={resetAllMatches}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset All
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{matchQuestion.prompt}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/70">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <p className="leading-tight">
                        <b>Drag an answer from the options list below</b> and drop it into each <b>blank slot</b> (or click an option then click a blank slot).
                      </p>
                    </div>
                  </div>

                  {/* Matching Rows: Function on Left -> Blank Drop Target Slot on Right */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between px-1 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <span>Column A (Function Expression)</span>
                      <span>Target Drop Slot (Matched First Derivative)</span>
                    </div>

                    {matchPairs.map((pair, index) => {
                      const letterLabel = String.fromCharCode(65 + index);
                      const matchedRight = matchedPairs[pair.leftText];
                      const isFilled = !!matchedRight;
                      const pairColor = isFilled ? getPairColor(pair.leftText, columnALeftTexts) : null;
                      const isDragOverSlot = dragOverTarget?.target === 'left' && dragOverTarget?.text === pair.leftText;
                      const isSelectedSlot = selectedLeftId === pair.leftText;

                      return (
                        <div
                          key={pair.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isFilled && pairColor
                              ? `${pairColor.cardBg}`
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Function Expression (Column A) */}
                          <div className="flex items-center gap-2.5 min-w-[200px]">
                            <span
                              className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-black shrink-0 ${
                                isFilled && pairColor
                                  ? `${pairColor.badgeBg}`
                                  : 'bg-purple-100 text-purple-900'
                              }`}
                            >
                              {letterLabel}
                            </span>
                            <span className="font-bold text-xs text-slate-900 font-mono tracking-tight">
                              {pair.leftText}
                            </span>
                          </div>

                          {/* Arrow connector */}
                          <div className="hidden md:flex items-center text-slate-300 font-bold px-1">
                            →
                          </div>

                          {/* Drop Target Slot (Blank Initially, Filled upon Drop) */}
                          <div
                            onDragOver={(e) => handleDragOver(e, 'left', pair.leftText)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnLeft(e, pair.leftText)}
                            onClick={() => {
                              if (selectedLeftId && selectedLeftId !== pair.leftText && columnBRightOptions.includes(selectedLeftId)) {
                                setMatchedPairs((prev) => ({
                                  ...prev,
                                  [pair.leftText]: selectedLeftId,
                                }));
                                setSelectedLeftId(null);
                              } else {
                                handleLeftClick(pair.leftText);
                              }
                            }}
                            className={`flex-1 min-h-[44px] rounded-xl border-2 transition-all p-2 flex items-center justify-between cursor-pointer select-none ${
                              isDragOverSlot
                                ? 'border-dashed border-purple-600 bg-purple-100 ring-2 ring-purple-400 scale-[1.01] shadow-md'
                                : isFilled
                                ? 'border-solid border-emerald-300 bg-white/90 shadow-2xs'
                                : isSelectedSlot
                                ? 'border-dashed border-purple-500 bg-purple-50 ring-2 ring-purple-300'
                                : 'border-dashed border-slate-300 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-300'
                            }`}
                          >
                            {isFilled && matchedRight ? (
                              <div className="flex items-center justify-between w-full gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'right', matchedRight)}
                                    onDragEnd={handleDragEnd}
                                    className="cursor-grab active:cursor-grabbing inline-flex"
                                  >
                                    <GripVertical className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600 shrink-0" />
                                  </span>
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Slot {letterLabel}
                                  </span>
                                  <span className="font-mono font-bold text-xs text-emerald-950 truncate">
                                    {matchedRight}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMatch(pair.leftText);
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                                  title="Clear slot & return option to bottom list"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-full gap-2 text-slate-400 text-xs py-1">
                                {isDragOverSlot ? (
                                  <span className="font-bold text-purple-700 animate-pulse flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Drop Answer Here!
                                  </span>
                                ) : isSelectedSlot ? (
                                  <span className="text-[11px] font-bold text-purple-700">
                                    Selected — Click an answer below to place
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                                      +
                                    </span>
                                    <span>[ Blank Slot {letterLabel} ] Drop derivative here</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Below List: Draggable Answer Choices Bank */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedItem && draggedItem.source === 'right') {
                        const leftKey = Object.keys(matchedPairs).find((k) => matchedPairs[k] === draggedItem.text);
                        if (leftKey) removeMatch(leftKey);
                      }
                    }}
                    className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f39223]"></span>
                        Available Answer Options (Drag from below into blank slots above)
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {columnBRightOptions.filter((opt) => !Object.values(matchedPairs).includes(opt)).length} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {columnBRightOptions.map((rightText, index) => {
                        const matchedLeftKey = Object.keys(matchedPairs).find((k) => matchedPairs[k] === rightText);
                        const isPlaced = !!matchedLeftKey;
                        const matchedLeftIndex = matchedLeftKey ? columnALeftTexts.indexOf(matchedLeftKey) : -1;
                        const matchedLeftLetter = matchedLeftIndex >= 0 ? String.fromCharCode(65 + matchedLeftIndex) : null;
                        const isSelectedAnswer = selectedLeftId === rightText;

                        return (
                          <div
                            key={index}
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'right', rightText, `${index + 1}`)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              if (isPlaced && matchedLeftKey) {
                                removeMatch(matchedLeftKey);
                              } else {
                                handleLeftClick(rightText);
                              }
                            }}
                            className={`p-3 rounded-xl border text-xs transition-all cursor-grab active:cursor-grabbing select-none flex flex-col justify-between gap-2 shadow-2xs ${
                              isPlaced
                                ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-60 hover:opacity-100 hover:border-red-300'
                                : isSelectedAnswer
                                ? 'bg-[#f39223] text-white border-[#f39223] ring-2 ring-[#fcd8b3] shadow-md scale-102'
                                : 'bg-white border-slate-300 text-slate-900 hover:border-[#f39223] hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5">
                                <GripVertical
                                  className={`w-3.5 h-3.5 ${
                                    isSelectedAnswer ? 'text-amber-100' : 'text-slate-400'
                                  }`}
                                />
                                <span
                                  className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center ${
                                    isSelectedAnswer
                                      ? 'bg-white text-[#c26d15]'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              </div>

                              {isPlaced ? (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                                  ✓ In Slot {matchedLeftLetter}
                                </span>
                              ) : isSelectedAnswer ? (
                                <span className="text-[9px] font-bold bg-[#c26d15] text-white px-1.5 py-0.5 rounded">
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-400">
                                  Drag me
                                </span>
                              )}
                            </div>

                            <div className="font-mono font-bold text-center py-1 truncate">
                              {rightText}
                            </div>

                            {isPlaced && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (matchedLeftKey) removeMatch(matchedLeftKey);
                                }}
                                className="w-full py-0.5 text-[10px] text-red-600 hover:bg-red-50 rounded font-bold transition-colors"
                              >
                                Return to pool ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Question 3: Interactive Fill in the Blanks (Drag to Blank) */}
              {fillBlanksQuestion && (
                <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-xs">
                  {/* Question Header & Action bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider">
                        Question 3 • Fill in the Blanks ({fillBlanksQuestion.marks} Marks)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Drag to Blank
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {Object.keys(blankAnswers).length} / {blankSlots.length} Blanks Filled
                      </span>
                      {Object.keys(blankAnswers).length > 0 && (
                        <button
                          type="button"
                          onClick={resetAllBlanks}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset Blanks
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{fillBlanksQuestion.prompt}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200/70">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <p className="leading-tight">
                        <b>Drag appropriate terms from the word bank below</b> and drop them directly into each <b>dashed blank box</b>.
                      </p>
                    </div>
                  </div>

                  {/* Blank Sentences List with Interactive Drop Zones */}
                  <div className="space-y-3 pt-1">
                    {blankSlots.map((slot, sIdx) => {
                      const placedTerm = blankAnswers[slot.id];
                      const isFilled = !!placedTerm;
                      const isDragOverThisSlot = dragOverTarget?.target === 'blank_slot' && dragOverTarget?.text === slot.id;

                      return (
                        <div
                          key={slot.id}
                          className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2.5 text-xs"
                        >
                          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] flex items-center justify-center font-black shrink-0">
                            {sIdx + 1}
                          </span>

                          <span className="font-semibold text-slate-800">
                            {slot.sentencePrefix}
                          </span>

                          {/* In-Line Blank Slot Drop Target */}
                          <div
                            onDragOver={(e) => handleDragOver(e, 'blank_slot', slot.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnBlankSlot(e, slot.id)}
                            onClick={() => handleBlankSlotClick(slot.id)}
                            className={`min-w-[140px] px-3 py-1.5 rounded-xl border-2 transition-all flex items-center justify-between gap-1.5 cursor-pointer select-none ${
                              isDragOverThisSlot
                                ? 'border-dashed border-indigo-600 bg-indigo-100 ring-2 ring-indigo-400 scale-105 shadow-md'
                                : isFilled
                                ? 'border-solid border-indigo-400 bg-indigo-50/90 shadow-2xs text-indigo-950 font-bold'
                                : selectedBlankOption
                                ? 'border-dashed border-indigo-400 bg-indigo-50/40 text-indigo-600 animate-pulse'
                                : 'border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30'
                            }`}
                          >
                            {isFilled ? (
                              <>
                                <span
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, 'blank_slot', placedTerm, undefined, slot.id)}
                                  onDragEnd={handleDragEnd}
                                  className="cursor-grab active:cursor-grabbing inline-flex"
                                >
                                  <GripVertical className="w-3.5 h-3.5 text-indigo-400 hover:text-indigo-700 shrink-0" />
                                </span>
                                <span className="font-mono font-bold text-xs text-indigo-950">
                                  {placedTerm}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeBlankAnswer(slot.id);
                                  }}
                                  className="p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                                  title="Remove from blank"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] font-medium flex items-center gap-1 mx-auto text-slate-400">
                                <span className="text-indigo-500 font-bold">+</span>
                                <span>[ {slot.label} ]</span>
                              </span>
                            )}
                          </div>

                          {slot.sentenceSuffix && (
                            <span className="font-semibold text-slate-800">
                              {slot.sentenceSuffix}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Draggable Word/Term Bank at Bottom */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedItem && draggedItem.source === 'blank_slot' && draggedItem.slotId) {
                        removeBlankAnswer(draggedItem.slotId);
                      }
                    }}
                    className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                        Draggable Word / Term Bank
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {blankOptions.filter((opt) => !Object.values(blankAnswers).includes(opt)).length} Available
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {blankOptions.map((option, optIdx) => {
                        const filledSlotId = Object.keys(blankAnswers).find((k) => blankAnswers[k] === option);
                        const isPlaced = !!filledSlotId;
                        const filledSlot = blankSlots.find((s) => s.id === filledSlotId);
                        const isSelectedOpt = selectedBlankOption === option;

                        return (
                          <div
                            key={optIdx}
                            draggable={!isPlaced}
                            onDragStart={(e) => handleDragStart(e, 'blank_option', option)}
                            onDragEnd={handleDragEnd}
                            onClick={() => {
                              if (isPlaced && filledSlotId) {
                                removeBlankAnswer(filledSlotId);
                              } else {
                                setSelectedBlankOption(isSelectedOpt ? null : option);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition-all select-none flex items-center gap-2 ${
                              isPlaced
                                ? 'bg-slate-200/80 border-slate-300 text-slate-400 opacity-60 hover:opacity-100 hover:border-red-300 cursor-pointer'
                                : isSelectedOpt
                                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400 shadow-md scale-105 cursor-pointer'
                                : 'bg-white border-slate-300 text-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-md cursor-grab active:cursor-grabbing hover:-translate-y-0.5'
                            }`}
                          >
                            {!isPlaced && <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            <span>{option}</span>

                            {isPlaced ? (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                                ✓ In {filledSlot?.label || 'Blank'}
                              </span>
                            ) : isSelectedOpt ? (
                              <span className="text-[9px] font-bold bg-indigo-700 text-white px-1.5 py-0.5 rounded">
                                Selected
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Question 5: Sequence & Step Ordering */}
              {stepQuestion && (
                <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-indigo-200 shadow-xs">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider">
                        Sequence & Step Ordering ({stepQuestion.marks} Marks)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                        <ListOrdered className="w-3 h-3" />
                        Arrange in Order
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {placedSolutionSteps.length} / {stepQuestion.orderedSteps?.length || 0} Items Arranged
                      </span>
                      {placedSolutionSteps.length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetSolutionSteps}
                          className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset All
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{stepQuestion.prompt}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200/70">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <p className="leading-tight">
                        <b>Click "+" on the available items below</b> to arrange them in the correct sequential or chronological order. <b>Beware of incorrect or distractor items!</b>
                      </p>
                    </div>
                  </div>

                  {/* Arranged Steps Target Area */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Your Arranged Sequence:
                    </span>

                    {placedSolutionSteps.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 text-center space-y-1 text-xs text-slate-500">
                        <p className="font-bold text-indigo-900">No items added to sequence yet</p>
                        <p className="text-[11px] text-slate-400">
                          Click any step, paragraph or event from the Available Items pool below to start building your sequence
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {placedSolutionSteps.map((stepText, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-3 bg-white rounded-xl border-2 border-indigo-200 shadow-xs flex items-center justify-between gap-3 text-xs animate-in fade-in"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0">
                                {sIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-900 leading-snug">
                                {stepText}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveSolutionStep(sIdx, 'up')}
                                disabled={sIdx === 0}
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveSolutionStep(sIdx, 'down')}
                                disabled={sIdx === placedSolutionSteps.length - 1}
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveSolutionStep(sIdx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Remove Item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Steps Bank */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Available Items Pool ({allAvailableSteps.filter((s) => !placedSolutionSteps.includes(s)).length} Available)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {allAvailableSteps.map((stepText, stIdx) => {
                        const isPlaced = placedSolutionSteps.includes(stepText);
                        const placedIdx = placedSolutionSteps.indexOf(stepText);

                        return (
                          <div
                            key={stIdx}
                            onClick={() => {
                              if (!isPlaced) handleAddSolutionStep(stepText);
                            }}
                            className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                              isPlaced
                                ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                                : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 cursor-pointer shadow-2xs hover:shadow-xs'
                            }`}
                          >
                            <span className="font-medium">{stepText}</span>

                            {isPlaced ? (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                                ✓ Placed as #{placedIdx + 1}
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add to Order</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Question 4: Short Answer Spot Response */}
              {shortQuestion && (
                <div className="space-y-3 p-5 bg-slate-50/70 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider">
                      Question 4 • Conceptual Quick Answer ({shortQuestion.marks} Marks)
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Geometry</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{shortQuestion.prompt}</h3>

                  <textarea
                    rows={2}
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    placeholder="Type your concise geometric explanation here (e.g. slope of tangent line to the curve at point a)..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-[#f39223] focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer Bar */}
        {!hasSubmitted && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-[#f39223]" />
              <span>Answers are encrypted & auto-graded upon submission</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowStudentAssessmentModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Dismiss for Now
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Live Assessment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
