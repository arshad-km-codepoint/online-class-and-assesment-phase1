import React, { useState, useRef, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  Zap,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  BookOpen,
  X,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Share2,
  Lock,
  Edit3,
  Layers,
  Check,
  ListOrdered,
  Sliders,
  RotateCcw,
  Radio,
  Activity,
  Filter,
  Eye,
  Paperclip,
  CheckSquare,
  Search,
  ArrowUpRight,
  LayoutGrid,
  Columns3,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import {
  LiveAssessmentSubmission,
  LiveAssessmentQuestion,
  LiveInClassAssessment,
  LiveStudentProgressRecord,
  StudentQuestionAttachment,
} from '../../types';
import { QuestionStudentUpload } from '../common/QuestionStudentUpload';

export const LiveAssessmentTeacherReviewModal: React.FC = () => {
  const { showTeacherAssessmentReviewModal, activeLiveAssessment, reviewingAssessment } = useExam();
  const targetAssessment = reviewingAssessment || activeLiveAssessment;

  if (!showTeacherAssessmentReviewModal || !targetAssessment) return null;
  return <LiveAssessmentTeacherReviewModalContent key={targetAssessment.id} assessment={targetAssessment} />;
};

const LiveAssessmentTeacherReviewModalContent: React.FC<{ assessment: LiveInClassAssessment }> = ({ assessment }) => {
  const {
    closeAssessmentSubmissionsReview,
    setShowTeacherAssessmentReviewModal,
    gradeLiveStudentSubmission,
    publishAssessmentLeaderboard,
    closeLiveAssessment,
    addToast,
  } = useExam();

  const activeLiveAssessment = assessment;
  const isPastOrClosed = activeLiveAssessment.status === 'closed' || activeLiveAssessment.status === 'published';

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    activeLiveAssessment.submissions[0]?.id || ''
  );
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [customScoreOverride, setCustomScoreOverride] = useState<number | null>(null);

  // Question-level score override state (Sequence Ordering & other question types)
  const [stepScoreInputs, setStepScoreInputs] = useState<Record<string, number>>({});
  const [stepReasonInputs, setStepReasonInputs] = useState<Record<string, string>>({});

  const selectedSub =
    activeLiveAssessment.submissions.find((s) => s.id === selectedSubmissionId) ||
    activeLiveAssessment.submissions[0];

  const handleOverrideQuestionMark = (questionId: string, newScore: number, reason?: string) => {
    if (!selectedSub) return;

    const currentAnswers = { ...selectedSub.answers };
    const currentAns = currentAnswers[questionId] || { questionId };

    const previousScore = currentAns.scoreAwarded || 0;
    const scoreDiff = newScore - previousScore;
    const newTotalScore = Math.max(0, Math.min(selectedSub.maxMarks, parseFloat((selectedSub.totalScore + scoreDiff).toFixed(1))));
    const newPercentage = Math.round((newTotalScore / selectedSub.maxMarks) * 100);

    const updatedAns = {
      ...currentAns,
      scoreAwarded: newScore,
      isOverridden: true,
      teacherOverriddenScore: newScore,
      overrideReason: reason || currentAns.overrideReason || 'Sequence proof verified by instructor',
    };

    currentAnswers[questionId] = updatedAns;

    gradeLiveStudentSubmission(activeLiveAssessment.id, selectedSub.id, {
      answers: currentAnswers,
      totalScore: newTotalScore,
      percentage: newPercentage,
      status: 'reviewed',
    });

    addToast(
      'Sequence Mark Overridden',
      `Awarded ${newScore} marks for Sequence Ordering to ${selectedSub.studentName}. Total: ${newTotalScore}/${selectedSub.maxMarks}.`,
      'success'
    );
  };

  const handleResetQuestionMark = (q: LiveAssessmentQuestion) => {
    if (!selectedSub) return;
    const currentAns = selectedSub.answers[q.id];
    if (!currentAns) return;

    // Recalculate original score based on prefix matching
    let originalScore = 0;
    if (q.type === 'step_ordering') {
      const correctSteps = q.orderedSteps || [];
      const studentPlaced = currentAns.placedSteps || [];
      const isExactMatch =
        studentPlaced.length === correctSteps.length &&
        studentPlaced.every((s, idx) => s === correctSteps[idx]);
      if (isExactMatch) {
        originalScore = q.marks;
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
          originalScore = parseFloat(((correctPrefixCount / correctSteps.length) * q.marks).toFixed(1));
        }
      }
    }

    const previousScore = currentAns.scoreAwarded || 0;
    const scoreDiff = originalScore - previousScore;
    const newTotalScore = Math.max(0, Math.min(selectedSub.maxMarks, parseFloat((selectedSub.totalScore + scoreDiff).toFixed(1))));
    const newPercentage = Math.round((newTotalScore / selectedSub.maxMarks) * 100);

    const updatedAnswers = {
      ...selectedSub.answers,
      [q.id]: {
        ...currentAns,
        scoreAwarded: originalScore,
        isOverridden: false,
        teacherOverriddenScore: undefined,
        overrideReason: undefined,
      },
    };

    gradeLiveStudentSubmission(activeLiveAssessment.id, selectedSub.id, {
      answers: updatedAnswers,
      totalScore: newTotalScore,
      percentage: newPercentage,
    });

    setStepScoreInputs((prev) => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
    setStepReasonInputs((prev) => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });

    addToast('Mark Reset', `Restored auto-graded mark (${originalScore} Marks) for ${selectedSub.studentName}.`, 'info');
  };

  // View Modes: Live Monitor Grid vs Detailed Question Grading vs Class Attachments Gallery
  const [activeViewTab, setActiveViewTab] = useState<'monitor' | 'grading' | 'attachments'>('monitor');
  const [progressFilter, setProgressFilter] = useState<'all' | 'submitted' | 'in_progress' | 'not_started'>('all');
  const [viewDensity, setViewDensity] = useState<'compact' | 'detailed'>('compact');
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [selectedAttachmentQuestionFilter, setSelectedAttachmentQuestionFilter] = useState<string>('all');
  const [submissionSearchQuery, setSubmissionSearchQuery] = useState<string>('');

  // Hover Popover State for Compact 30+ Mode
  const [hoveredStudent, setHoveredStudent] = useState<{
    student: LiveStudentProgressRecord;
    rect: DOMRect;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Candidate progress list combining liveProgress or generating from submissions
  const allProgressList: LiveStudentProgressRecord[] = activeLiveAssessment.liveProgress || [
    ...activeLiveAssessment.submissions.map((s) => ({
      studentId: s.studentId,
      studentName: s.studentName,
      rollNo: s.rollNo,
      avatar: s.avatar,
      status: 'submitted' as const,
      currentQuestionIndex: activeLiveAssessment.questions.length,
      answeredQuestionsCount: Object.keys(s.answers).length,
      totalQuestionsCount: activeLiveAssessment.questions.length,
      startedAt: s.submittedAt,
      lastActiveTime: s.submittedAt,
      timeSpentSeconds: 120,
      isNfcVerified: s.verifiedVia === 'nfc' || s.verifiedVia === 'both',
      isFaceVerified: s.verifiedVia === 'face' || s.verifiedVia === 'both',
      submissionId: s.id,
      totalScore: s.totalScore,
      percentage: s.percentage,
      uploadedFiles: Array.from(
        new Map(
          [
            ...(s.attachments || []),
            ...Object.values(s.answers).flatMap((a) => a.uploadedFiles || []),
          ].map((att) => [att.id, att])
        ).values()
      ),
    })),
  ];

  // Derive counts
  const totalSubmissions = activeLiveAssessment.submissions.length;
  const submittedCount = allProgressList.filter((p) => p.status === 'submitted').length;
  const inProgressCount = allProgressList.filter((p) => p.status === 'in_progress').length;
  const notStartedCount = allProgressList.filter((p) => p.status === 'not_started').length;
  const totalLearnersCount = allProgressList.length;

  // Aggregate all uploaded attachments across questions and students
  const allClassAttachments: {
    student: LiveStudentProgressRecord;
    attachment: StudentQuestionAttachment;
    questionNumber: number;
    questionPrompt: string;
    questionId: string;
  }[] = [];

  allProgressList.forEach((student) => {
    // Check submission answers
    const sub = activeLiveAssessment.submissions.find((s) => s.studentId === student.studentId);
    if (sub) {
      const seenAttIds = new Set<string>();
      sub.attachments?.forEach((att) => {
        if (!seenAttIds.has(att.id)) {
          seenAttIds.add(att.id);
          allClassAttachments.push({
            student,
            attachment: att,
            questionNumber: 0,
            questionPrompt: 'Assessment Rough Work & Solutions Sheet',
            questionId: 'overall-attachments',
          });
        }
      });
      activeLiveAssessment.questions.forEach((q, qIdx) => {
        const ans = sub.answers[q.id];
        ans?.uploadedFiles?.forEach((att) => {
          if (!seenAttIds.has(att.id)) {
            seenAttIds.add(att.id);
            allClassAttachments.push({
              student,
              attachment: att,
              questionNumber: qIdx + 1,
              questionPrompt: q.prompt,
              questionId: q.id,
            });
          }
        });
      });
    } else {
      // Check in-progress attachments
      student.uploadedFiles?.forEach((att) => {
        allClassAttachments.push({
          student,
          attachment: att,
          questionNumber: student.currentQuestionIndex + 1,
          questionPrompt: activeLiveAssessment.questions[student.currentQuestionIndex]?.prompt || 'Live Rough Work',
          questionId: activeLiveAssessment.questions[student.currentQuestionIndex]?.id || 'q-curr',
        });
      });
    }
  });

  const filteredProgressList = allProgressList.filter((p) => {
    const matchesFilter = progressFilter === 'all' ? true : p.status === progressFilter;
    const matchesSearch =
      !searchStudentQuery ||
      p.studentName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      p.rollNo.toLowerCase().includes(searchStudentQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const avgScore =
    totalSubmissions > 0
      ? (
          activeLiveAssessment.submissions.reduce((sum, s) => sum + s.totalScore, 0) /
          totalSubmissions
        ).toFixed(1)
      : '0.0';

  const avgPercentage =
    totalSubmissions > 0
      ? Math.round(
          activeLiveAssessment.submissions.reduce((sum, s) => sum + s.percentage, 0) /
          totalSubmissions
        )
      : 0;

  const handleSaveTeacherGrade = () => {
    if (!selectedSub) return;
    const scoreToApply = customScoreOverride !== null ? customScoreOverride : selectedSub.totalScore;
    gradeLiveStudentSubmission(activeLiveAssessment.id, selectedSub.id, {
      totalScore: scoreToApply,
      percentage: Math.round((scoreToApply / selectedSub.maxMarks) * 100),
      teacherFeedback: feedbackInput || selectedSub.teacherFeedback || 'Reviewed by teacher.',
      status: 'reviewed',
    });
    setFeedbackInput('');
    setCustomScoreOverride(null);
  };

  const handleClose = () => {
    if (closeAssessmentSubmissionsReview) {
      closeAssessmentSubmissionsReview();
    } else {
      setShowTeacherAssessmentReviewModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-[98vw] 2xl:max-w-[1720px] h-[95vh] max-h-[96vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#f39223] rounded-xl shadow-md text-white shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isPastOrClosed
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-[#f39223]/20 text-[#f39223] border-[#f39223]/30'
                }`}>
                  {isPastOrClosed ? 'Assessment Submissions Archive' : 'Teacher Live Assessment Studio'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeLiveAssessment.subject} • {activeLiveAssessment.title}
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white mt-0.5">
                {isPastOrClosed ? 'Past Assessment Submissions & Detailed Evaluation' : 'Live Assessment Real-Time Monitor & Evaluation Studio'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPastOrClosed && (
              <>
                <button
                  onClick={() => publishAssessmentLeaderboard(activeLiveAssessment.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Broadcast Leaderboard</span>
                </button>

                <button
                  onClick={() => closeLiveAssessment(activeLiveAssessment.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lock Submissions</span>
                </button>
              </>
            )}

            {isPastOrClosed && (
              <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Completed Assessment</span>
              </span>
            )}

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Review Studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Core View Mode Tabs Strip */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('monitor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeViewTab === 'monitor'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-200" />
              <span>📡 Live Student Monitor</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {totalLearnersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveViewTab('grading')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeViewTab === 'grading'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-200" />
              <span>📝 Detailed Grading & Question Overrides</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {totalSubmissions}
              </span>
            </button>

            <button
              onClick={() => setActiveViewTab('attachments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeViewTab === 'attachments'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5 text-amber-200" />
              <span>📎 Uploaded Workings Gallery</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {allClassAttachments.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <b className="text-slate-200">Live Sync Active</b>
            </span>
          </div>
        </div>

        {/* 4 Quick Metrics Pill Strip - Compact */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Submitted Submissions
              </span>
              <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                {submittedCount} / {totalLearnersCount} Students
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Currently In-Progress
              </span>
              <p className="text-sm sm:text-base font-black text-[#f39223] leading-tight">
                {inProgressCount} Actively Answering
              </p>
            </div>
            <Zap className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Class Average (Score)
              </span>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                {avgScore} / {activeLiveAssessment.totalMarks} ({avgPercentage}%)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-purple-500 shrink-0" />
          </div>

          <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Uploads Attached
              </span>
              <p className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                {allClassAttachments.length} Rough Sheets
              </p>
            </div>
            <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>
        </div>

        {/* Tab 1: Live Real-Time Student Monitor View */}
        {activeViewTab === 'monitor' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950/40">
            {/* Filter & Live Search Toolbar */}
            <div className="p-2.5 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setProgressFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    progressFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All ({totalLearnersCount})
                </button>
                <button
                  onClick={() => setProgressFilter('submitted')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    progressFilter === 'submitted'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Submitted ({submittedCount})
                </button>
                <button
                  onClick={() => setProgressFilter('in_progress')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    progressFilter === 'in_progress'
                      ? 'bg-[#f39223] text-white shadow-xs'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  In-Progress ({inProgressCount})
                </button>
                <button
                  onClick={() => setProgressFilter('not_started')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    progressFilter === 'not_started'
                      ? 'bg-slate-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Not Started ({notStartedCount})
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    placeholder="Search student or roll no..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
                  />
                </div>

                {/* View Density Toggle (Compact 30+ Grid vs Detailed) */}
                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewDensity('compact')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewDensity === 'compact'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Compact 30+ Grid: View full class in single window"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-amber-500" />
                    <span>Compact (30+ Grid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewDensity('detailed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewDensity === 'detailed'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Detailed Cards View"
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span>Detailed</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Cards Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div
                className={
                  viewDensity === 'compact'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-2 sm:gap-2.5'
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                }
              >
                {filteredProgressList.map((item) => {
                  const percentComplete = Math.round((item.answeredQuestionsCount / item.totalQuestionsCount) * 100);
                  const isSubmitted = item.status === 'submitted';
                  const isInProgress = item.status === 'in_progress';
                  const isNotStarted = item.status === 'not_started';

                  // --- Compact View (Optimized for 30+ Students in a Single Window) ---
                  if (viewDensity === 'compact') {
                    return (
                      <div
                        key={item.studentId}
                        onClick={() => {
                          if (item.submissionId) {
                            setSelectedSubmissionId(item.submissionId);
                            setActiveViewTab('grading');
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (viewDensity !== 'compact') return;
                          if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                          const rect = e.currentTarget.getBoundingClientRect();
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                          hoverTimeoutRef.current = setTimeout(() => {
                            setHoveredStudent({ student: item, rect });
                          }, 160);
                        }}
                        onMouseLeave={() => {
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                          closeTimeoutRef.current = setTimeout(() => {
                            setHoveredStudent(null);
                          }, 160);
                        }}
                        className={`rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-150 relative ${
                          isSubmitted && item.submissionId
                            ? 'cursor-pointer hover:border-emerald-500 hover:shadow-md hover:scale-[1.01]'
                            : ''
                        } ${
                          isSubmitted
                            ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                            : isInProgress
                            ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/60 ring-1 ring-amber-400/20 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        {/* Top Info: Avatar, Name, Roll & Score/Status */}
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={item.avatar}
                                alt={item.studentName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              {isInProgress && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                                </span>
                              )}
                              {isSubmitted && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                  <Check className="w-1.5 h-1.5 text-white" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">
                                {item.studentName}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono truncate leading-none mt-0.5">
                                #{item.rollNo}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSubmitted ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>{item.totalScore !== undefined ? `${item.totalScore}m` : 'Done'}</span>
                              </span>
                            ) : isInProgress ? (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 flex items-center gap-0.5 animate-pulse">
                                <Zap className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Q{(item.currentQuestionIndex || 0) + 1}</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Wait
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: 5-segment Question Progress Bar */}
                        <div className="my-1.5 space-y-1">
                          <div className="flex items-center gap-1">
                            {activeLiveAssessment.questions.map((q, qIndex) => {
                              const isAnswered = qIndex < item.answeredQuestionsCount;
                              const isCurrent = qIndex === item.currentQuestionIndex && isInProgress;
                              return (
                                <div
                                  key={q.id}
                                  className={`h-1.5 flex-1 rounded-full transition-all ${
                                    isAnswered
                                      ? 'bg-emerald-500'
                                      : isCurrent
                                      ? 'bg-amber-500 animate-pulse ring-1 ring-amber-400'
                                      : 'bg-slate-200 dark:bg-slate-700'
                                  }`}
                                  title={`Q${qIndex + 1}: ${isAnswered ? 'Answered' : isCurrent ? 'Answering' : 'Pending'}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="truncate">
                              {isSubmitted
                                ? 'Completed'
                                : isInProgress
                                ? `${item.answeredQuestionsCount}/${item.totalQuestionsCount} (${percentComplete}%)`
                                : '0/5 answered'}
                            </span>
                            {isSubmitted && item.percentage !== undefined && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                {item.percentage}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom: Workings count & Quick Action */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-1 text-slate-400 truncate">
                            {item.uploadedFiles && item.uploadedFiles.length > 0 ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveViewTab('attachments');
                                }}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                                title="View candidate rough sheets in gallery"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>{item.uploadedFiles.length} Sheet{item.uploadedFiles.length > 1 ? 's' : ''}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 truncate">
                                {item.lastActiveTime && isSubmitted ? 'Submitted' : isInProgress ? 'Active now' : 'Idle'}
                              </span>
                            )}
                          </div>

                          {isSubmitted && item.submissionId ? (
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-0.5">
                              <span>Grade</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          ) : isInProgress ? (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              <span>Live</span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400">Offline</span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // --- Detailed View (Original Detailed Card Layout) ---
                  return (
                    <div
                      key={item.studentId}
                      className={`rounded-2xl border p-4.5 space-y-3.5 transition-all shadow-xs ${
                        isSubmitted
                          ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/70 hover:shadow-md'
                          : isInProgress
                          ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/70 ring-1 ring-amber-400/20 hover:shadow-md'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                      }`}
                    >
                      {/* Top Info Bar */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={item.avatar}
                              alt={item.studentName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            {isInProgress && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              </span>
                            )}
                            {isSubmitted && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.studentName}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono truncate">
                              Roll: {item.rollNo} • {item.isNfcVerified ? 'SmartCard Verified' : 'Standard Auth'}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isSubmitted ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Submitted
                            </span>
                          ) : isInProgress ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                              <Zap className="w-3 h-3 text-amber-600" />
                              In-Progress
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Not Started
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Answering Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Question Progress</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {item.answeredQuestionsCount} / {item.totalQuestionsCount} Answered ({percentComplete}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSubmitted
                                ? 'bg-emerald-500'
                                : isInProgress
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentComplete}%` }}
                          />
                        </div>
                        {/* 5-slot dot step tracker */}
                        <div className="flex items-center justify-between pt-0.5">
                          {activeLiveAssessment.questions.map((q, qIndex) => {
                            const isAnswered = qIndex < item.answeredQuestionsCount;
                            const isCurrent = qIndex === item.currentQuestionIndex && isInProgress;
                            return (
                              <div
                                key={q.id}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-center transition-all ${
                                  isAnswered
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : isCurrent
                                    ? 'bg-amber-500 text-white animate-pulse font-extrabold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                                title={`Q${qIndex + 1}: ${q.prompt}`}
                              >
                                Q{qIndex + 1}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Activity Telemetry */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Live Telemetry:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {item.lastActiveTime || 'Waiting for candidate...'}
                          </span>
                        </div>
                        {isSubmitted && item.totalScore !== undefined && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 font-bold">
                            <span className="text-slate-500">Auto-Evaluated Score:</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {item.totalScore} / {activeLiveAssessment.totalMarks} Marks ({item.percentage}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Uploaded Rough Work / Attachments Preview */}
                      <div className="pt-0.5">
                        {item.uploadedFiles && item.uploadedFiles.length > 0 ? (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              Attached Workings ({item.uploadedFiles.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.uploadedFiles.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.previewUrl || att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 truncate max-w-full transition-colors cursor-pointer"
                                  title={`Click to inspect: ${att.name}`}
                                >
                                  <Eye className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{att.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            No rough calculation attachments uploaded yet
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-1">
                        {isSubmitted && item.submissionId ? (
                          <button
                            onClick={() => {
                              setSelectedSubmissionId(item.submissionId!);
                              setActiveViewTab('grading');
                            }}
                            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-200" />
                            <span>Grade Submission & Review Overrides →</span>
                          </button>
                        ) : isInProgress ? (
                          <div className="w-full py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>Monitoring Real-Time Inputs...</span>
                          </div>
                        ) : (
                          <div className="w-full py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-500 text-center">
                            Awaiting student launch in lecture
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Detailed Card Popover on Hover (Compact 30+ View) */}
            {viewDensity === 'compact' && hoveredStudent && (() => {
              const hItem = hoveredStudent.student;
              const percentComplete = Math.round((hItem.answeredQuestionsCount / hItem.totalQuestionsCount) * 100);
              const isSubmitted = hItem.status === 'submitted';
              const isInProgress = hItem.status === 'in_progress';
              const isNotStarted = hItem.status === 'not_started';

              const rect = hoveredStudent.rect;
              const cardWidth = 340;
              const placeRight = rect.right + cardWidth + 16 <= window.innerWidth;
              const left = placeRight ? rect.right + 10 : Math.max(12, rect.left - cardWidth - 10);
              const top = Math.max(16, Math.min(rect.top - 12, window.innerHeight - 440));

              return (
                <div
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
                  }}
                  onMouseLeave={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    closeTimeoutRef.current = setTimeout(() => {
                      setHoveredStudent(null);
                    }, 160);
                  }}
                  style={{
                    position: 'fixed',
                    left: `${left}px`,
                    top: `${top}px`,
                    width: `${cardWidth}px`,
                    zIndex: 9999,
                  }}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md shadow-2xl p-4 space-y-3 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10"
                >
                  {/* Top Bar: Avatar, Name, Roll, Auth, Status */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={hItem.avatar}
                          alt={hItem.studentName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        {isInProgress && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {hItem.studentName}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                          Roll: #{hItem.rollNo} • {hItem.isNfcVerified ? 'SmartCard Verified' : hItem.isFaceVerified ? 'Biometric Face Auth' : 'Standard Auth'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSubmitted ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Submitted
                        </span>
                      ) : isInProgress ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3 text-amber-600" />
                          Q{(hItem.currentQuestionIndex || 0) + 1}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Progress & 5 Step Tracker */}
                  <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Question Progress</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {hItem.answeredQuestionsCount} / {hItem.totalQuestionsCount} Answered ({percentComplete}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSubmitted
                            ? 'bg-emerald-500'
                            : isInProgress
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-0.5 gap-1">
                      {activeLiveAssessment.questions.map((q, qIndex) => {
                        const isAnswered = qIndex < hItem.answeredQuestionsCount;
                        const isCurrent = qIndex === hItem.currentQuestionIndex && isInProgress;
                        return (
                          <div
                            key={q.id}
                            className={`flex-1 text-[9px] font-bold py-0.5 rounded text-center transition-all ${
                              isAnswered
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : isCurrent
                                ? 'bg-amber-500 text-white animate-pulse font-extrabold'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-400'
                            }`}
                            title={`Q${qIndex + 1}: ${q.prompt}`}
                          >
                            Q{qIndex + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telemetry & Auto-Evaluated Score */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Telemetry:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {hItem.lastActiveTime || 'Waiting for candidate...'}
                      </span>
                    </div>
                    {isSubmitted && hItem.totalScore !== undefined && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700/60 font-bold">
                        <span className="text-slate-500">Auto-Evaluated Score:</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {hItem.totalScore} / {activeLiveAssessment.totalMarks} Marks ({hItem.percentage}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rough Work / Attachments Preview */}
                  <div className="space-y-1">
                    {hItem.uploadedFiles && hItem.uploadedFiles.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          Attached Rough Workings ({hItem.uploadedFiles.length})
                        </span>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {hItem.uploadedFiles.map((att) => (
                            <a
                              key={att.id}
                              href={att.previewUrl || att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 truncate max-w-full transition-colors cursor-pointer"
                              title={`Inspect: ${att.name}`}
                            >
                              <Eye className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">
                        No rough calculation attachments uploaded yet
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-0.5">
                    {isSubmitted && hItem.submissionId ? (
                      <button
                        onClick={() => {
                          setSelectedSubmissionId(hItem.submissionId!);
                          setActiveViewTab('grading');
                          setHoveredStudent(null);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-200" />
                        <span>Grade Submission & Review Overrides →</span>
                      </button>
                    ) : isInProgress ? (
                      <div className="w-full py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span>Monitoring Real-Time Inputs...</span>
                      </div>
                    ) : (
                      <div className="w-full py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-500 text-center">
                        Awaiting student launch in lecture
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 3: All Student Workings & Calculation Uploads Gallery */}
        {activeViewTab === 'attachments' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950/40">
            {/* Gallery Filter Toolbar */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter by Question:
                </span>
                <button
                  onClick={() => setSelectedAttachmentQuestionFilter('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAttachmentQuestionFilter === 'all'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Questions ({allClassAttachments.length})
                </button>
                {activeLiveAssessment.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedAttachmentQuestionFilter(q.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAttachmentQuestionFilter === q.id
                        ? 'bg-[#f39223] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Q{idx + 1} ({q.type.replace('_', ' ')})
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {allClassAttachments.length} Total Uploaded Calculation Artifacts
              </span>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {allClassAttachments.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Paperclip className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Uploaded Attachments Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Students will attach handwritten rough sheets and calculation notes as they solve the live questions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allClassAttachments
                    .filter((item) =>
                      selectedAttachmentQuestionFilter === 'all'
                        ? true
                        : item.questionId === selectedAttachmentQuestionFilter
                    )
                    .map((item) => (
                      <div
                        key={item.attachment.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs hover:shadow-md transition-all"
                      >
                        {/* Header: Student & Question Slot */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={item.student.avatar}
                              alt={item.student.studentName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {item.student.studentName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">Roll: {item.student.rollNo}</p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fff4e6] text-[#c26d15] dark:bg-amber-950/40 dark:text-amber-300 border border-[#fcd8b3] dark:border-amber-800/40 shrink-0">
                            Question {item.questionNumber}
                          </span>
                        </div>

                        {/* Image / Thumbnail Preview */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 aspect-video flex items-center justify-center group">
                          {item.attachment.type.includes('image') || (item.attachment.previewUrl && !item.attachment.name.endsWith('.pdf')) ? (
                            <img
                              src={item.attachment.previewUrl || item.attachment.url}
                              alt={item.attachment.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-center p-4">
                              <BookOpen className="w-8 h-8 mx-auto text-indigo-500 mb-1" />
                              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                PDF Document / Derivation Note
                              </span>
                            </div>
                          )}

                          <a
                            href={item.attachment.previewUrl || item.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span>Click to Inspect High-Res</span>
                          </a>
                        </div>

                        {/* Attachment Metadata */}
                        <div className="text-[11px] space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{item.attachment.name}</p>
                          <p className="text-slate-400 text-[10px]">
                            {item.attachment.size} • Attached at {item.attachment.uploadedAt}
                          </p>
                        </div>

                        {/* Question Prompt Snippet */}
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          "{item.questionPrompt}"
                        </p>

                        {/* Button to Jump to Student Submission */}
                        {item.student.submissionId && (
                          <button
                            onClick={() => {
                              setSelectedSubmissionId(item.student.submissionId!);
                              setActiveViewTab('grading');
                            }}
                            className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#f39223] hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Inspect & Grade this Question</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Detailed Question Responses & Overrides Studio */}
        {activeViewTab === 'grading' && (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Column: Student Submissions Roster */}
            <div className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span>Candidate Submissions</span>
                <span className="text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-800 dark:text-slate-200 font-bold">
                  {submissionSearchQuery
                    ? `${activeLiveAssessment.submissions.filter((s) => s.studentName.toLowerCase().includes(submissionSearchQuery.toLowerCase()) || s.rollNo.toLowerCase().includes(submissionSearchQuery.toLowerCase())).length} of ${activeLiveAssessment.submissions.length}`
                    : `${activeLiveAssessment.submissions.length} Handed In`}
                </span>
              </div>

              {/* Submissions Search Filter */}
              <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate or roll #..."
                    value={submissionSearchQuery}
                    onChange={(e) => setSubmissionSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition-all placeholder:text-slate-400"
                  />
                  {submissionSearchQuery && (
                    <button
                      onClick={() => setSubmissionSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {(() => {
                  const filteredSubmissions = activeLiveAssessment.submissions.filter((sub) => {
                    if (!submissionSearchQuery.trim()) return true;
                    const q = submissionSearchQuery.toLowerCase();
                    return (
                      sub.studentName.toLowerCase().includes(q) ||
                      sub.rollNo.toLowerCase().includes(q)
                    );
                  });

                  if (filteredSubmissions.length === 0) {
                    return (
                      <div className="py-12 px-4 text-center text-slate-400 space-y-2">
                        <FileCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {submissionSearchQuery ? 'No Matching Students' : 'No Submissions Found'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {submissionSearchQuery
                            ? `No handed-in candidate found matching "${submissionSearchQuery}".`
                            : 'No students have submitted answers for this assessment yet.'}
                        </p>
                      </div>
                    );
                  }

                  return filteredSubmissions.map((sub) => {
                    const isSelected = sub.id === (selectedSub?.id || '');
                    const attachedFilesCount = (sub.attachments?.length || 0) +
                      Object.values(sub.answers).reduce((acc, a) => acc + (a.uploadedFiles?.length || 0), 0);

                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubmissionId(sub.id);
                          setFeedbackInput(sub.teacherFeedback || '');
                          setCustomScoreOverride(null);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#f39223] text-white border-[#f39223] shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={sub.avatar}
                              alt={sub.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-white/40"
                            />
                            {sub.status === 'reviewed' && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <Check className="w-1.5 h-1.5 text-white" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{sub.studentName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] truncate ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                                #{sub.rollNo} • {sub.submittedAt.split(' ')[0]}
                              </span>
                              {attachedFilesCount > 0 && (
                                <span
                                  className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                  }`}
                                  title={`${attachedFilesCount} attached rough calculation sheets`}
                                >
                                  <Paperclip className="w-2.5 h-2.5" />
                                  <span>{attachedFilesCount}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-md inline-block ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : sub.percentage >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {sub.totalScore}/{sub.maxMarks}
                          </span>
                          <p className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                            {sub.percentage}%
                          </p>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

          {/* Right Column: Detailed Question Responses & Interactive Grading */}
          {selectedSub ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Student Profile & Fast Score Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSub.avatar}
                    alt={selectedSub.studentName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#f39223] shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedSub.studentName}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Roll No: {selectedSub.rollNo} • Submitted at {selectedSub.submittedAt}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                        ✓ {selectedSub.verifiedVia === 'nfc'
                          ? `RFID/NFC Smartcard Verified (${selectedSub.verificationDetails?.cardUid || '04:A2:8B:E3:71'})`
                          : selectedSub.verifiedVia === 'face'
                          ? 'Biometric Facial Scan (99.4% Match)'
                          : 'Dual-Factor Authenticated (Card & Face)'}
                      </span>
                      {selectedSub.verificationDetails?.verifiedAt && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          Auth Timestamp: {selectedSub.verificationDetails.verifiedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Awarded Score
                    </span>
                    <p className="text-2xl font-black text-[#f39223]">
                      {selectedSub.totalScore} / {selectedSub.maxMarks}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedSub.status === 'reviewed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {selectedSub.status === 'reviewed' ? '✓ Reviewed' : 'Pending Review'}
                  </span>
                </div>
              </div>

              {/* Dynamic Question Responses List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#f39223]" />
                    Question-By-Question Responses ({activeLiveAssessment.questions.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">Auto-evaluated against master key</span>
                </div>

                {activeLiveAssessment.questions.map((q, idx) => {
                  const studentAns = selectedSub.answers[q.id];

                  // Render MCQ
                  if (q.type === 'mcq') {
                    const isCorrect = studentAns?.isAutoCorrect;
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Multiple Choice ({q.marks} Marks)
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            }`}
                          >
                            {isCorrect ? `✓ Correct (+${q.marks} Marks)` : '✗ Incorrect (0 Marks)'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Student's Selected Option:</span>
                            <span className={`font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {studentAns?.selectedOptionIndex !== undefined && q.options?.[studentAns.selectedOptionIndex]
                                ? q.options[studentAns.selectedOptionIndex]
                                : 'No option chosen'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500">Correct Solution Key:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {q.options?.[q.correctOptionIndex || 0]}
                            </span>
                          </div>
                          {q.explanation && (
                            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 italic">
                              💡 Solution rationale: {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Render MMCQ (Multiple Correct)
                  if (q.type === 'mmcq') {
                    const isCorrect = studentAns?.isAutoCorrect;
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Multi-Select MCQ ({q.marks} Marks)
                          </span>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            Score Awarded: {studentAns?.scoreAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                          <div>
                            <span className="text-slate-500 block mb-1">Student's Selected Options:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {studentAns?.selectedOptionIndices?.map((optIdx) => (
                                <span key={optIdx} className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                                  {q.options?.[optIdx]}
                                </span>
                              )) || <span className="text-slate-400">None</span>}
                            </div>
                          </div>
                          <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-slate-500 block mb-1">Correct Answer Keys:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {q.correctOptionIndices?.map((optIdx) => (
                                <span key={optIdx} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                                  {q.options?.[optIdx]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Match the Following
                  if (q.type === 'match_following') {
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Match the Following ({q.marks} Marks)
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                            Score Awarded: {studentAns?.scoreAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.matchingPairs?.map((pair) => {
                            const studentMatchedRight = studentAns?.matchedPairs?.[pair.leftText];
                            const isPairCorrect = studentMatchedRight === pair.rightText;

                            return (
                              <div
                                key={pair.id}
                                className={`p-3 rounded-xl border space-y-1 ${
                                  isPairCorrect
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-900 dark:text-slate-100">{pair.leftText}</span>
                                  <span className={isPairCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                                    {isPairCorrect ? '✓ Matched' : '✗ Mis-match'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                  Student Paired: <b>{studentMatchedRight || 'Unmatched'}</b>
                                </p>
                                {!isPairCorrect && (
                                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                    Correct Key: {pair.rightText}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Render Fill in the Blanks
                  if (q.type === 'fill_in_blanks') {
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Fill in the Blanks ({q.marks} Marks)
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                            Score: {studentAns?.scoreAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="space-y-2 text-xs">
                          {q.blankSlots?.map((slot) => {
                            const studentAnswer = studentAns?.blankAnswers?.[slot.id];
                            const isCorrect = studentAnswer === slot.correctAnswer;

                            return (
                              <div
                                key={slot.id}
                                className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{slot.sentencePrefix}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  }`}>
                                    {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="text-slate-500">Student Dropped:</span>
                                  <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-700 dark:text-red-400'}`}>
                                    {studentAnswer || '[Unanswered]'}
                                  </span>
                                  {!isCorrect && (
                                    <>
                                      <span className="text-slate-300">|</span>
                                      <span className="text-slate-500">Correct:</span>
                                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{slot.correctAnswer}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Render Step Ordering
                  if (q.type === 'step_ordering') {
                    const isOverridden = !!studentAns?.isOverridden;
                    const currentScore = studentAns?.scoreAwarded !== undefined ? studentAns.scoreAwarded : 0;
                    const studentSteps = studentAns?.placedSteps || [];
                    const masterSteps = q.orderedSteps || [];
                    const inputScore = stepScoreInputs[q.id] !== undefined ? stepScoreInputs[q.id] : currentScore;
                    const inputReason = stepReasonInputs[q.id] !== undefined ? stepReasonInputs[q.id] : (studentAns?.overrideReason || '');

                    return (
                      <div key={q.id} className={`p-4 bg-white dark:bg-slate-800 rounded-2xl border transition-all space-y-3.5 shadow-xs ${
                        isOverridden ? 'border-amber-400 dark:border-amber-600/70 ring-1 ring-amber-400/40' : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                              Q{idx + 1} • Logical Sequence Ordering ({q.marks} Marks)
                            </span>
                            {isOverridden && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center gap-1">
                                <Edit3 className="w-2.5 h-2.5" />
                                Override Active
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                              isOverridden
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700'
                                : currentScore > 0
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300'
                            }`}>
                              Score Awarded: <strong>{currentScore}</strong> / {q.marks} Marks
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        {/* Steps Comparison View: Student's Sequence vs Master Sequence */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Student's Arranged Order */}
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                Student's Arranged Order:
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {studentSteps.length} / {masterSteps.length} Steps
                              </span>
                            </div>

                            {studentSteps.length === 0 ? (
                              <p className="text-[11px] text-slate-400 italic py-2">
                                [Candidate did not place any sequence items in the live assessment]
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {studentSteps.map((sText, sIdx) => {
                                  const isStepCorrectPos = sIdx < masterSteps.length && sText === masterSteps[sIdx];
                                  const isDistractor = q.distractorSteps?.includes(sText);

                                  return (
                                    <div
                                      key={sIdx}
                                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 ${
                                        isStepCorrectPos
                                          ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                                          : isDistractor
                                          ? 'bg-red-50/90 dark:bg-red-950/30 border-red-300 text-red-950 dark:text-red-200'
                                          : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 text-amber-950 dark:text-amber-200'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${
                                          isStepCorrectPos
                                            ? 'bg-emerald-600 text-white'
                                            : isDistractor
                                            ? 'bg-red-600 text-white'
                                            : 'bg-amber-600 text-white'
                                        }`}>
                                          #{sIdx + 1}
                                        </span>
                                        <span className="truncate font-medium">{sText}</span>
                                      </div>

                                      <span className="text-[9px] font-extrabold shrink-0 px-1 py-0.5 rounded bg-white/70 dark:bg-black/30">
                                        {isStepCorrectPos ? '✓ Exact' : isDistractor ? '✗ Distractor' : '⇄ Misplaced'}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Master Solution Sequence */}
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                              Master Solution Sequence:
                            </span>
                            <div className="space-y-1.5">
                              {masterSteps.map((step, sIdx) => (
                                <div key={sIdx} className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                                  <span className="w-4 h-4 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                    {sIdx + 1}
                                  </span>
                                  <span className="truncate">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Sequence Ordering Mark Override Option Card */}
                        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/60 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                              <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Sequence Ordering Mark Override & Partial Credit</span>
                            </div>

                            {isOverridden && (
                              <button
                                type="button"
                                onClick={() => handleResetQuestionMark(q)}
                                className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-red-600 flex items-center gap-1 underline transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset to Auto-Graded Mark</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                            Teacher manual evaluation: award partial marks or full credit based on mathematical logic steps and candidate rough sheet.
                          </p>

                          {/* Quick Preset Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase mr-1">
                              Quick Presets:
                            </span>
                            {[
                              { label: '0 Marks', score: 0 },
                              { label: '+1 Mark', score: 1 },
                              { label: '+2 Marks (50%)', score: 2 },
                              { label: '+3 Marks (75%)', score: 3 },
                              { label: `Full Marks (${q.marks})`, score: q.marks },
                            ].map((preset) => (
                              <button
                                key={preset.score}
                                type="button"
                                onClick={() => {
                                  setStepScoreInputs((prev) => ({ ...prev, [q.id]: preset.score }));
                                  handleOverrideQuestionMark(q.id, preset.score, inputReason);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  currentScore === preset.score
                                    ? 'bg-[#f39223] text-white border-[#f39223] shadow-xs scale-102'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-300 hover:border-[#f39223] hover:bg-amber-100/50'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          {/* Custom Score Stepper & Reason Input Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-amber-200/80 dark:border-amber-800/40">
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 shrink-0">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Award:</span>
                              <input
                                type="number"
                                min={0}
                                max={q.marks}
                                step={0.5}
                                value={inputScore}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(q.marks, parseFloat(e.target.value) || 0));
                                  setStepScoreInputs((prev) => ({ ...prev, [q.id]: val }));
                                }}
                                className="w-12 text-center font-black text-xs text-amber-900 dark:text-amber-200 bg-transparent focus:outline-none"
                              />
                              <span className="text-[11px] font-bold text-slate-400">/ {q.marks} Marks</span>
                            </div>

                            <input
                              type="text"
                              value={inputReason}
                              onChange={(e) => setStepReasonInputs((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Teacher note for mark override (e.g. valid intermediate steps verified in rough sheet)..."
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />

                            <button
                              type="button"
                              onClick={() => handleOverrideQuestionMark(q.id, inputScore, inputReason)}
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer shrink-0"
                            >
                              Apply Mark Override
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Short Answer / Conceptual
                  if (q.type === 'short_answer') {
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Conceptual Response ({q.marks} Marks)
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                            Score: {studentAns?.scoreAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Candidate Answer Text:
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                              "{studentAns?.textAnswer || 'No response provided'}"
                            </p>
                          </div>

                          {q.sampleAnswer && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Reference Model Answer:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">
                                {q.sampleAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Candidate's Attached Workings & Solution Sheets (Consolidated Bottom Attachment with Multiple File Support) */}
                {(() => {
                  const candidateAttachments = Array.from(
                    new Map(
                      [
                        ...(selectedSub.attachments || []),
                        ...Object.values(selectedSub.answers).flatMap((a) => a.uploadedFiles || []),
                      ].map((att) => [att.id, att])
                    ).values()
                  );
                  if (candidateAttachments.length === 0) return null;
                  return (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-amber-100 text-[#c26d15] dark:bg-amber-950/60 dark:text-amber-300">
                            <Paperclip className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                              <span>Candidate's Attached Rough Work & Solution Sheets</span>
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                                {candidateAttachments.length} {candidateAttachments.length === 1 ? 'File' : 'Files'} Attached
                              </span>
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Supporting notebook scans, rough calculations, and proof sheets submitted by {selectedSub.studentName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <QuestionStudentUpload
                        questionId="overall-submission"
                        attachments={candidateAttachments}
                        onAddAttachment={() => {}}
                        onRemoveAttachment={() => {}}
                        readOnly
                        label="Candidate's Supporting Rough Sheets & Solution Notes"
                        helperText="Attached notebook scans, rough calculations, and proof sheets for this assessment"
                        accentColor="amber"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Teacher Assessment Feedback & Mark Finalization Bar */}
              <div className="p-4 bg-[#fff4e6] dark:bg-amber-950/30 rounded-2xl border border-[#fcd8b3] dark:border-amber-800/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#c26d15] dark:text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#f39223]" />
                    Teacher Custom Feedback & Score Override
                  </span>
                  <button
                    onClick={() => {
                      addToast('Marks Pushed', `Synchronized ${selectedSub.studentName}'s score to Gradebook!`, 'success');
                    }}
                    className="text-[11px] font-semibold text-[#f39223] hover:underline cursor-pointer"
                  >
                    Sync to Gradebook
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Enter personalized feedback for student..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      max={selectedSub.maxMarks}
                      min={0}
                      value={customScoreOverride !== null ? customScoreOverride : selectedSub.totalScore}
                      onChange={(e) => setCustomScoreOverride(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-[#c26d15] dark:text-amber-400 text-center"
                      title="Adjust Score"
                    />
                    <button
                      onClick={handleSaveTeacherGrade}
                      className="px-4 py-2 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap cursor-pointer"
                    >
                      Save Evaluation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Users className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Student Submission Selected</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                {activeLiveAssessment.submissions.length > 0
                  ? 'Click a student in the roster on the left to review their exact answers.'
                  : 'This assessment currently has no submitted student responses.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
};
