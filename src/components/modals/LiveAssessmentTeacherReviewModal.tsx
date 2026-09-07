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
} from 'lucide-react';
import { LiveAssessmentSubmission } from '../../types';

export const LiveAssessmentTeacherReviewModal: React.FC = () => {
  const { showTeacherAssessmentReviewModal, activeLiveAssessment } = useExam();
  if (!showTeacherAssessmentReviewModal || !activeLiveAssessment) return null;
  return <LiveAssessmentTeacherReviewModalContent key={activeLiveAssessment.id} assessment={activeLiveAssessment}/>;
};

const LiveAssessmentTeacherReviewModalContent: React.FC<{ assessment: NonNullable<ReturnType<typeof useExam>["activeLiveAssessment"]> }> = ({ assessment }) => {
  const {
    showTeacherAssessmentReviewModal,
    setShowTeacherAssessmentReviewModal,
    gradeLiveStudentSubmission,
    publishAssessmentLeaderboard,
    closeLiveAssessment,
    addToast,
  } = useExam();
  const activeLiveAssessment = assessment;



  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(
    activeLiveAssessment.submissions[0]?.id || ''
  );
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [customScoreOverride, setCustomScoreOverride] = useState<number | null>(null);

  const selectedSub =
    activeLiveAssessment.submissions.find((s) => s.id === selectedSubmissionId) ||
    activeLiveAssessment.submissions[0];

  const totalSubmissions = activeLiveAssessment.submissions.length;
  const avgScore = totalSubmissions > 0
    ? (
        activeLiveAssessment.submissions.reduce((sum, s) => sum + s.totalScore, 0) /
        totalSubmissions
      ).toFixed(1)
    : '0.0';

  const mcqQuestion = activeLiveAssessment.questions.find((q) => q.type === 'mcq');
  const matchQuestion = activeLiveAssessment.questions.find((q) => q.type === 'match_following');
  const fillBlanksQuestion = activeLiveAssessment.questions.find((q) => q.type === 'fill_in_blanks');
  const shortQuestion = activeLiveAssessment.questions.find((q) => q.type === 'short_answer');

  // Calculate MCQ accuracy across submissions
  const mcqCorrectCount = mcqQuestion
    ? activeLiveAssessment.submissions.filter(
        (s) => s.answers[mcqQuestion.id]?.isAutoCorrect
      ).length
    : 0;
  const mcqAccuracyPct = totalSubmissions > 0 ? Math.round((mcqCorrectCount / totalSubmissions) * 100) : 0;

  const handleSaveTeacherGrade = () => {
    if (!selectedSub) return;
    const scoreToApply = customScoreOverride !== null ? customScoreOverride : selectedSub.totalScore;
    gradeLiveStudentSubmission(activeLiveAssessment.id, selectedSub.id, {
      totalScore: scoreToApply,
      percentage: Math.round((scoreToApply / selectedSub.maxMarks) * 100),
      teacherFeedback: feedbackInput || selectedSub.teacherFeedback || 'Reviewed by teacher during live lecture.',
      status: 'reviewed',
    });
    setFeedbackInput('');
    setCustomScoreOverride(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f39223] rounded-xl shadow-md">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f39223]/20 text-[#f39223] border border-[#f39223]/30">
                  Teacher Live Assessment Studio
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeLiveAssessment.subject} • {activeLiveAssessment.title}
                </span>
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Live Submissions & Real-Time Student Assessment
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => publishAssessmentLeaderboard(activeLiveAssessment.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Broadcast Leaderboard</span>
            </button>

            <button
              onClick={() => closeLiveAssessment(activeLiveAssessment.id)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Submissions</span>
            </button>

            <button
              onClick={() => setShowTeacherAssessmentReviewModal(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Quick Metrics Pill Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Submissions
              </span>
              <p className="text-xl font-black text-slate-900">{totalSubmissions} / 6 Students</p>
            </div>
            <Users className="w-5 h-5 text-slate-500" />
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Class Average
              </span>
              <p className="text-xl font-black text-emerald-600">
                {avgScore} / {activeLiveAssessment.totalMarks}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Q1 MCQ Accuracy
              </span>
              <p className="text-xl font-black text-[#f39223]">{mcqAccuracyPct}% Correct</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-[#f39223]" />
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assessment Status
              </span>
              <p className="text-sm font-extrabold text-amber-700 uppercase">
                {activeLiveAssessment.status === 'active' ? '● Live Active' : '✓ Closed'}
              </p>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Main 2-Column Split: Submissions List (Left) + Detail Assessment & Grading (Right) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Column: Student Submissions Roster */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Candidate Submissions</span>
              <span className="text-[11px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-800">
                {activeLiveAssessment.submissions.length} Handed In
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {activeLiveAssessment.submissions.map((sub) => {
                const isSelected = sub.id === (selectedSub?.id || '');
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmissionId(sub.id);
                      setFeedbackInput(sub.teacherFeedback || '');
                      setCustomScoreOverride(null);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#f39223] text-white border-[#f39223] shadow-sm'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
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
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.totalScore}/{sub.maxMarks}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Question Responses & Interactive Grading */}
          {selectedSub ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Student Profile & Fast Score Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedSub.avatar}
                    alt={selectedSub.studentName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#f39223] shadow-xs"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{selectedSub.studentName}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Roll No: {selectedSub.rollNo} • Submitted at {selectedSub.submittedAt}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        ✓ {selectedSub.verifiedVia === 'nfc'
                          ? `RFID/NFC Smartcard Verified (${selectedSub.verificationDetails?.cardUid || '04:A2:8B:E3:71'})`
                          : selectedSub.verifiedVia === 'face'
                          ? 'Biometric Facial Scan (99.4% Match)'
                          : 'Dual-Factor Authenticated (Card & Face)'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Auth Timestamp: {selectedSub.verificationDetails?.verifiedAt || selectedSub.submittedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedSub.status === 'reviewed' ? '✓ Reviewed' : 'Pending Review'}
                  </span>
                </div>
              </div>

              {/* Question 1 Review: MCQ */}
              {mcqQuestion && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Q1 • Multiple Choice Question ({mcqQuestion.marks} Marks)
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                        selectedSub.answers[mcqQuestion.id]?.isAutoCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedSub.answers[mcqQuestion.id]?.isAutoCorrect
                        ? `✓ Correct (+${mcqQuestion.marks} Marks)`
                        : '✗ Incorrect (0 Marks)'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{mcqQuestion.prompt}</p>

                  {/* Student Choice vs Correct Option */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Student's Selected Option:</span>
                      <span className="font-bold text-slate-900">
                        {selectedSub.answers[mcqQuestion.id]?.selectedOptionIndex !== undefined
                          ? mcqQuestion.options?.[selectedSub.answers[mcqQuestion.id]!.selectedOptionIndex!]
                          : 'No option chosen'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Correct Solution Key:</span>
                      <span className="font-bold text-emerald-700">
                        {mcqQuestion.options?.[mcqQuestion.correctOptionIndex || 0]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Question 2 Review: Match the Following */}
              {matchQuestion && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Q2 • Match the Following ({matchQuestion.marks} Marks)
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      Score Awarded: {selectedSub.answers[matchQuestion.id]?.scoreAwarded} / {matchQuestion.marks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{matchQuestion.prompt}</p>

                  {/* Pair-by-Pair Matching Results Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {matchQuestion.matchingPairs?.map((pair) => {
                      const studentMatchedRight =
                        selectedSub.answers[matchQuestion.id]?.matchedPairs?.[pair.leftText];
                      const isPairCorrect = studentMatchedRight === pair.rightText;

                      return (
                        <div
                          key={pair.id}
                          className={`p-3 rounded-xl border space-y-1 ${
                            isPairCorrect
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : 'bg-red-50/70 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-900">{pair.leftText}</span>
                            <span>{isPairCorrect ? '✓ Matched' : '✗ Mis-match'}</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Student Paired: <b>{studentMatchedRight || 'Unmatched'}</b>
                          </p>
                          {!isPairCorrect && (
                            <p className="text-[10px] text-emerald-700 font-bold">
                              Correct Key: {pair.rightText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 3 Review: Fill in the Blanks */}
              {fillBlanksQuestion && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Q3 • Fill in the Blanks ({fillBlanksQuestion.marks} Marks)
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Score: {selectedSub.answers[fillBlanksQuestion.id]?.scoreAwarded} / {fillBlanksQuestion.marks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{fillBlanksQuestion.prompt}</p>

                  <div className="space-y-2 text-xs">
                    {fillBlanksQuestion.blankSlots?.map((slot) => {
                      const studentAnswer = selectedSub.answers[fillBlanksQuestion.id]?.blankAnswers?.[slot.id];
                      const isCorrect = studentAnswer === slot.correctAnswer;

                      return (
                        <div
                          key={slot.id}
                          className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                            isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{slot.sentencePrefix}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-500">Student Dropped:</span>
                            <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-800' : 'text-red-700'}`}>
                              {studentAnswer || '[Unanswered]'}
                            </span>
                            {!isCorrect && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-500">Correct:</span>
                                <span className="font-mono font-bold text-emerald-700">{slot.correctAnswer}</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question 4 Review: Short Answer & Manual Scoring */}
              {shortQuestion && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Q4 • Conceptual Response ({shortQuestion.marks} Marks)
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      Score: {selectedSub.answers[shortQuestion.id]?.scoreAwarded} / {shortQuestion.marks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900">{shortQuestion.prompt}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Candidate Answer Text:
                      </span>
                      <p className="text-slate-800 font-medium mt-0.5">
                        "{selectedSub.answers[shortQuestion.id]?.textAnswer || 'No response provided'}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Reference Model Answer:
                      </span>
                      <p className="text-emerald-800 font-semibold text-[11px] mt-0.5">
                        {shortQuestion.sampleAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Assessment Feedback & Mark Finalization Bar */}
              <div className="p-4 bg-[#fff4e6] rounded-2xl border border-[#fcd8b3] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#c26d15]">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#f39223]" />
                    Teacher Custom Feedback & Score Override
                  </span>
                  <button
                    onClick={() => {
                      addToast('Marks Pushed', `Synchronized ${selectedSub.studentName}'s score to Gradebook!`, 'success');
                    }}
                    className="text-[11px] font-semibold text-[#f39223] hover:underline"
                  >
                    Sync to Gradebook
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Enter personalized feedback for student (e.g. Excellent grasp of Chain Rule)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f39223]"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      max={selectedSub.maxMarks}
                      min={0}
                      value={customScoreOverride !== null ? customScoreOverride : selectedSub.totalScore}
                      onChange={(e) => setCustomScoreOverride(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-[#c26d15] text-center"
                      title="Adjust Score"
                    />
                    <button
                      onClick={handleSaveTeacherGrade}
                      className="px-4 py-2 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
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
              <p className="text-xs font-bold text-slate-600">No Student Submission Selected</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                Click a student in the roster on the left to review their exact answers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
