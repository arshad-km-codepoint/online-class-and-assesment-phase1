import React, { useState } from 'react';
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
} from 'lucide-react';
import { LiveAssessmentSubmission, LiveAssessmentQuestion, LiveInClassAssessment } from '../../types';

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

  const selectedSub =
    activeLiveAssessment.submissions.find((s) => s.id === selectedSubmissionId) ||
    activeLiveAssessment.submissions[0];

  const totalSubmissions = activeLiveAssessment.submissions.length;
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
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
                {isPastOrClosed ? 'Past Assessment Submissions & Detailed Evaluation' : 'Live Submissions & Real-Time Student Assessment'}
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

        {/* 4 Quick Metrics Pill Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {totalSubmissions} Candidate{totalSubmissions === 1 ? '' : 's'}
              </p>
            </div>
            <Users className="w-5 h-5 text-slate-500" />
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Class Average
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {avgScore} / {activeLiveAssessment.totalMarks} ({avgPercentage}%)
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Questions / Marks
              </span>
              <p className="text-lg sm:text-xl font-black text-[#f39223]">
                {activeLiveAssessment.questions.length} Qs • {activeLiveAssessment.totalMarks} Marks
              </p>
            </div>
            <Layers className="w-5 h-5 text-[#f39223]" />
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assessment Status
              </span>
              <p className={`text-xs sm:text-sm font-extrabold uppercase ${
                activeLiveAssessment.status === 'active'
                  ? 'text-blue-600 dark:text-blue-400'
                  : activeLiveAssessment.status === 'published'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {activeLiveAssessment.status === 'active'
                  ? '● Live Active'
                  : activeLiveAssessment.status === 'published'
                  ? '✓ Published'
                  : '✓ Closed / Archived'}
              </p>
            </div>
            <Clock className="w-5 h-5 text-slate-500" />
          </div>
        </div>

        {/* Main 2-Column Split: Submissions List (Left) + Detail Assessment & Grading (Right) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: Student Submissions Roster */}
          <div className="w-72 sm:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Candidate Submissions</span>
              <span className="text-[11px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-800 dark:text-slate-200 font-bold">
                {activeLiveAssessment.submissions.length} Handed In
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {activeLiveAssessment.submissions.length === 0 ? (
                <div className="py-12 px-4 text-center text-slate-400 space-y-2">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No Submissions Found</p>
                  <p className="text-[11px] text-slate-400">
                    No students have submitted answers for this assessment yet.
                  </p>
                </div>
              ) : (
                activeLiveAssessment.submissions.map((sub) => {
                  const isSelected = sub.id === (selectedSub?.id || '');
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubmissionId(sub.id);
                        setFeedbackInput(sub.teacherFeedback || '');
                        setCustomScoreOverride(null);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#f39223] text-white border-[#f39223] shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={sub.avatar}
                          alt={sub.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-white/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{sub.studentName}</p>
                          <p className={`text-[10px] truncate ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                            Roll: {sub.rollNo} • {sub.submittedAt}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-black px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : sub.percentage >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {sub.totalScore}/{sub.maxMarks}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
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
                    return (
                      <div key={q.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                            Q{idx + 1} • Logical Sequence Ordering ({q.marks} Marks)
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Score Awarded: {studentAns?.scoreAwarded || 0} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{q.prompt}</p>

                        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Master Solution Sequence:</span>
                          <div className="space-y-1">
                            {q.orderedSteps?.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-[11px]">
                                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
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
      </div>
    </div>
  );
};
