import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveNavTab,
  PortalMode,
  Student,
  Exam,
  MalpracticeAlert,
  SimilarityPair,
  RuleSetting,
  ActivityEvent,
  QuestionPaper,
  ScheduledExam,
  MonitoringStudent,
  LiveAlert,
  StudentSubmission,
  ResultSettings,
  RecentActivity,
  AnswerGradeDetail,
  ParentAccount,
  ChildStudent,
  ExamBasicDetailsFormData,
  ExamRecipientsFormData,
  ExamAcademicMappingFormData,
  ExamQuestionSourceFormData,
  ExamMarksDistributionFormData,
  ExamQuestionBankFormData,
  ExamPdfSetupFormData,
  ExamAnswerSubmissionConfigFormData,
  EvaluationDashboardItem,
  PRDEvaluationStatus,
  StudentAttemptEvaluationSession,
  StudentQuestionEvaluationItem,
  AttachmentEvaluationRecord,
  VisualAnnotationMark,
  AnnotationToolType,
  CandidateResultCalculationSummary,
  UserRole,
  StudentAccommodation,
  ExamSection,
  OnlineClass,
  CreateOnlineClassFormData,
  LiveInClassAssessment,
  LiveAssessmentSubmission,
  LiveAssessmentQuestion,
  PoolQuestion,
  StudentVerificationProfile,
} from '../types';
import {
  mockStudents as initialStudents,
  mockExams as initialExams,
  mockAlerts as initialAlerts,
  mockSimilarityPairs as initialSimilarityPairs,
  mockRules as initialRules,
  mockActivityFeed as initialActivities,
  mockQuestionPapers as initialQuestionPapers,
  mockScheduledExams as initialScheduledExams,
  mockMonitoringStudents as initialMonitoringStudents,
  mockLiveAlerts as initialLiveAlerts,
  mockSubmissions as initialSubmissions,
  mockResultSettings as initialResultSettings,
  mockRecentActivities as initialRecentActivities,
  mockParentAccount as initialParentAccount,
  mockEvaluationDashboardItems,
  mockStudentEvaluationAttempt,
  mockAttachmentEvaluationRecords,
  mockCandidateResultSummary,
  mockAccommodations as initialAccommodations,
  mockExamSections as initialExamSections,
  mockOnlineClasses as initialOnlineClasses,
  mockLiveAssessments as initialLiveAssessments,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

interface ExamContextType {
  // Global Portal Navigation & 5-Tier User Roles
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;

  // Student Accommodations & Accessibility
  accommodations: StudentAccommodation[];
  saveAccommodation: (acc: StudentAccommodation) => void;

  // Multi-Section Exam Creation & Validation (PRD Sec 18, 86, 87)
  examSections: ExamSection[];
  setExamSections: React.Dispatch<React.SetStateAction<ExamSection[]>>;
  addExamSection: (sec: ExamSection) => void;
  updateExamSection: (id: string, updates: Partial<ExamSection>) => void;
  removeExamSection: (id: string) => void;
  showExamPreviewModal: boolean;
  setShowExamPreviewModal: (show: boolean) => void;

  // Parent & Multi-Student State
  parentAccount: ParentAccount;
  selectedChild: ChildStudent;
  setSelectedChildId: (childId: string) => void;
  activeStudentExam: ScheduledExam | null;
  setActiveStudentExam: (exam: ScheduledExam | null) => void;
  studentAnswers: Record<string, { selectedOptionIndex?: number; textAnswer?: string; isMarkedForReview?: boolean }>;
  saveStudentAnswer: (questionId: string, answer: { selectedOptionIndex?: number; textAnswer?: string; isMarkedForReview?: boolean }) => void;
  studentUploadedFiles: Record<string, Array<{ id: string; fileName: string; fileSize: string; fileUrl: string; uploadedAt: string; fileType: string }>>;
  uploadStudentFile: (key: string, fileInfo: { fileName: string; fileSize: string; fileUrl: string; fileType: string }) => void;
  removeStudentFile: (key: string, fileId: string) => void;
  addQuestionPaper: (qp: QuestionPaper) => void;
  submitStudentExam: (examId: string) => void;
  studentExamSubmitted: boolean;
  setStudentExamSubmitted: (submitted: boolean) => void;

  // Legacy Proctoring State
  students: Student[];
  exams: Exam[];
  alerts: MalpracticeAlert[];
  similarityPairs: SimilarityPair[];
  rules: RuleSetting[];
  activities: ActivityEvent[];
  selectedStudent: Student | null;
  setSelectedStudent: (s: Student | null) => void;
  selectedAlert: MalpracticeAlert | null;
  setSelectedAlert: (a: MalpracticeAlert | null) => void;
  selectedExam: Exam | null;
  setSelectedExam: (e: Exam | null) => void;
  selectedSimilarityPair: SimilarityPair | null;
  setSelectedSimilarityPair: (p: SimilarityPair | null) => void;
  demoMode: boolean;
  setDemoMode: (active: boolean) => void;
  updateAlertStatus: (alertId: string, status: MalpracticeAlert['status'], notes?: string, reviewerName?: string) => void;
  toggleRule: (ruleId: string) => void;
  updateRuleConfig: (ruleId: string, updates: Partial<RuleSetting>) => void;
  addNewExam: (exam: Exam) => void;
  triggerMockViolation: () => void;
  terminateStudentSession: (studentId: string) => void;

  // Prototype 02 Form State
  createExamFormState: ExamBasicDetailsFormData;
  setCreateExamFormState: React.Dispatch<React.SetStateAction<ExamBasicDetailsFormData>>;
  updateCreateExamFormState: (updates: Partial<ExamBasicDetailsFormData>) => void;
  resetCreateExamFormState: () => void;

  // Prototype 03 Recipient Selection Form State
  createExamRecipientsState: ExamRecipientsFormData;
  setCreateExamRecipientsState: React.Dispatch<React.SetStateAction<ExamRecipientsFormData>>;
  updateCreateExamRecipientsState: (updates: Partial<ExamRecipientsFormData>) => void;
  resetCreateExamRecipientsState: () => void;

  // Prototype 04 Academic Mapping Form State
  createExamAcademicMappingState: ExamAcademicMappingFormData;
  setCreateExamAcademicMappingState: React.Dispatch<React.SetStateAction<ExamAcademicMappingFormData>>;
  updateCreateExamAcademicMappingState: (updates: Partial<ExamAcademicMappingFormData>) => void;
  resetCreateExamAcademicMappingState: () => void;

  // Prototype 05 Question Source Form State
  createExamQuestionSourceState: ExamQuestionSourceFormData;
  setCreateExamQuestionSourceState: React.Dispatch<React.SetStateAction<ExamQuestionSourceFormData>>;
  updateCreateExamQuestionSourceState: (updates: Partial<ExamQuestionSourceFormData>) => void;
  resetCreateExamQuestionSourceState: () => void;

  // Prototype 06 Question Type & Marks Distribution Form State
  createExamMarksDistributionState: ExamMarksDistributionFormData;
  setCreateExamMarksDistributionState: React.Dispatch<React.SetStateAction<ExamMarksDistributionFormData>>;
  updateCreateExamMarksDistributionState: (updates: Partial<ExamMarksDistributionFormData>) => void;
  resetCreateExamMarksDistributionState: () => void;

  // Prototype 07 Question Bank Browser Form State
  createExamQuestionBankState: ExamQuestionBankFormData;
  setCreateExamQuestionBankState: React.Dispatch<React.SetStateAction<ExamQuestionBankFormData>>;
  updateCreateExamQuestionBankState: (updates: Partial<ExamQuestionBankFormData>) => void;
  resetCreateExamQuestionBankState: () => void;

  // Prototype 09 PDF Setup Form State
  createExamPdfSetupState: ExamPdfSetupFormData;
  setCreateExamPdfSetupState: React.Dispatch<React.SetStateAction<ExamPdfSetupFormData>>;
  updateCreateExamPdfSetupState: (updates: Partial<ExamPdfSetupFormData>) => void;
  resetCreateExamPdfSetupState: () => void;

  // Prototype 10 Answer Submission Config Form State
  createExamAnswerSubmissionConfigState: ExamAnswerSubmissionConfigFormData;
  setCreateExamAnswerSubmissionConfigState: React.Dispatch<React.SetStateAction<ExamAnswerSubmissionConfigFormData>>;
  updateCreateExamAnswerSubmissionConfigState: (updates: Partial<ExamAnswerSubmissionConfigFormData>) => void;
  resetCreateExamAnswerSubmissionConfigState: () => void;

  // Teacher Module State
  questionPapers: QuestionPaper[];
  scheduledExams: ScheduledExam[];
  selectedExamId: string;
  setSelectedExamId: (id: string) => void;
  monitoringStudents: MonitoringStudent[];
  liveAlerts: LiveAlert[];
  studentSubmissions: StudentSubmission[];
  resultSettings: ResultSettings;
  recentActivities: RecentActivity[];

  // Prototype 22 Evaluation Dashboard State (PRD Section 26)
  evaluationDashboardItems: EvaluationDashboardItem[];
  setEvaluationDashboardItems: React.Dispatch<React.SetStateAction<EvaluationDashboardItem[]>>;
  updateEvaluationDashboardItemStatus: (id: string, status: PRDEvaluationStatus, obtainedMarks?: number | null, feedback?: string) => void;
  bulkPublishEvaluationDashboardItems: (ids?: string[]) => void;

  // Prototype 23 Answer Evaluation State (PRD Sections 25, 27, 28)
  activeEvaluationAttempt: StudentAttemptEvaluationSession;
  setActiveEvaluationAttempt: React.Dispatch<React.SetStateAction<StudentAttemptEvaluationSession>>;
  updateQuestionAwardedMarks: (questionId: string, marks: number, remarks?: string) => void;
  navigateAttemptQuestion: (target: 'next' | 'prev' | number) => void;
  completeAttemptEvaluation: () => void;

  // Prototype 24 Attachment Evaluation State (PRD Section 28)
  attachmentRecords: AttachmentEvaluationRecord[];
  activeAttachmentIndex: number;
  setActiveAttachmentIndex: (index: number) => void;
  updateAttachmentMarksAndRemarks: (recordId: string, marks: number, remarks: string) => void;
  addVisualAnnotationMark: (recordId: string, annotation: Omit<VisualAnnotationMark, 'id' | 'createdAt'>) => void;
  clearVisualAnnotations: (recordId: string) => void;
  navigateAttachmentRecord: (target: 'next' | 'prev' | number) => void;

  // Prototype 25 Result Calculation & Review State (PRD Sections 29, 30)
  candidateResultSummary: CandidateResultCalculationSummary;
  setCandidateResultSummary: React.Dispatch<React.SetStateAction<CandidateResultCalculationSummary>>;
  updatePassMarkThresholdPct: (newPassMarkPct: number) => void;
  publishCandidateResultSummary: () => void;

  // Selection & Modal State
  selectedStudentForDrawer: MonitoringStudent | null;
  setSelectedStudentForDrawer: (s: MonitoringStudent | null) => void;
  selectedSubmissionForEvaluation: StudentSubmission | null;
  setSelectedSubmissionForEvaluation: (sub: StudentSubmission | null) => void;
  selectedStudentResultPreview: StudentSubmission | null;
  setSelectedStudentResultPreview: (sub: StudentSubmission | null) => void;

  showScheduleModal: boolean;
  setShowScheduleModal: (show: boolean) => void;
  previewQuestionPaper: QuestionPaper | null;
  setPreviewQuestionPaper: (qp: QuestionPaper | null) => void;
  showPublishConfirmationModal: boolean;
  setShowPublishConfirmationModal: (show: boolean) => void;
  showBroadcastModal: boolean;
  setShowBroadcastModal: (show: boolean) => void;

  liveSimulationActive: boolean;
  setLiveSimulationActive: (active: boolean) => void;
  toasts: ToastMessage[];
  addToast: (title: string, description: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Online Classes & Virtual Lectures
  onlineClasses: OnlineClass[];
  activeLiveClass: OnlineClass | null;
  setActiveLiveClass: (c: OnlineClass | null) => void;
  addOnlineClass: (newClass: Omit<OnlineClass, 'id' | 'createdAt'>) => string;
  updateOnlineClass: (id: string, updates: Partial<OnlineClass>) => void;
  deleteOnlineClass: (id: string) => void;
  duplicateOnlineClass: (id: string) => void;
  startLiveClass: (id: string) => void;
  endLiveClass: (id: string) => void;

  // Live In-Class Assessment & Interactive Quizzes
  questionPool: PoolQuestion[];
  savePoolQuestion: (question: PoolQuestion) => boolean;
  deletePoolQuestion: (id: string) => boolean;
  liveAssessments: LiveInClassAssessment[];
  activeLiveAssessment: LiveInClassAssessment | null;
  setActiveLiveAssessment: (ass: LiveInClassAssessment | null) => void;
  editingLiveAssessment: LiveInClassAssessment | null;
  setEditingLiveAssessment: (ass: LiveInClassAssessment | null) => void;
  saveLiveAssessment: (assessment: LiveInClassAssessment) => void;
  deleteLiveAssessment: (id: string) => void;
  duplicateLiveAssessment: (id: string) => void;
  launchLiveAssessment: (assessment: LiveInClassAssessment) => void;
  launchSavedAssessmentInClass: (assessmentId: string, classId?: string) => void;
  submitLiveStudentAssessment: (submission: LiveAssessmentSubmission) => void;
  gradeLiveStudentSubmission: (assessmentId: string, submissionId: string, updates: Partial<LiveAssessmentSubmission>) => void;
  closeLiveAssessment: (assessmentId: string) => void;
  publishAssessmentLeaderboard: (assessmentId: string) => void;
  showStudentAssessmentModal: boolean;
  setShowStudentAssessmentModal: (show: boolean) => void;
  showTeacherAssessmentReviewModal: boolean;
  setShowTeacherAssessmentReviewModal: (show: boolean) => void;
  showAssessmentCreatorModal: boolean;
  setShowAssessmentCreatorModal: (show: boolean) => void;

  // Assessment Link & QR Code Sharing
  sharingAssessment: LiveInClassAssessment | null;
  setSharingAssessment: (ass: LiveInClassAssessment | null) => void;
  showShareAssessmentModal: boolean;
  setShowShareAssessmentModal: (show: boolean) => void;
  openShareAssessment: (assessment: LiveInClassAssessment) => void;
  closeShareAssessment: () => void;

  // Student Identity Verification (NFC/RFID & Face Scan)
  verifyingAssessment: LiveInClassAssessment | null;
  setVerifyingAssessment: (ass: LiveInClassAssessment | null) => void;
  showStudentVerificationModal: boolean;
  setShowStudentVerificationModal: (show: boolean) => void;
  verifiedStudent: StudentVerificationProfile | null;
  setVerifiedStudent: (profile: StudentVerificationProfile | null) => void;
  openStudentVerification: (assessment: LiveInClassAssessment) => void;
  completeStudentVerification: (profile: StudentVerificationProfile) => void;

  // Teacher Actions
  scheduleNewExam: (exam: ScheduledExam) => void;
  publishCurrentExam: () => void;
  updateExamStatus: (examId: string, status: ScheduledExam['status']) => void;
  duplicateExam: (examId: string) => void;
  deleteExam: (examId: string) => void;

  sendWarningToStudent: (studentId: string, message: string) => void;
  pauseStudentExam: (studentId: string) => void;
  resumeStudentExam: (studentId: string) => void;
  addExtraTime: (studentId: string, extraMinutes: number) => void;
  forceSubmitStudent: (studentId: string) => void;
  terminateStudentExam: (studentId: string) => void;
  broadcastAnnouncement: (target: 'all' | 'selected', message: string, selectedStudentIds?: string[]) => void;

  saveAnswerGrading: (submissionId: string, questionId: string, updates: Partial<AnswerGradeDetail>) => void;
  reEvaluateSubmission: (submissionId: string, reason: string) => void;
  finalizeSubmissionAssessment: (submissionId: string) => void;
  bulkFinalizeAssessments: (examId: string) => void;

  updateResultSettings: (settings: Partial<ResultSettings>) => void;
  publishExamResults: (examId: string, options: { notifyApp: boolean; notifyEmail: boolean; notifyParent: boolean }) => void;
  unpublishExamResults: (examId: string) => void;
  checkExamPublishBlocked: (examId: string) => EvaluationDashboardItem[];
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const VALID_TEACHER_TABS: ActiveNavTab[] = [
  'dashboard',
  'question-pool',
  'online-classes',
  'online-class-assessments',
  'create-class-assessment',
  'create-online-class',
  'live-classroom',
];

const VALID_STUDENT_TABS: ActiveNavTab[] = [
  'dashboard',
  'student-online-classes',
  'live-classroom',
];

const getTabFromPath = (pathname: string): { tab: ActiveNavTab; inferredMode?: PortalMode } | null => {
  if (typeof window === 'undefined') return null;
  const clean = pathname.replace(/^\/+/, '').replace(/\/+$/, '') as ActiveNavTab;
  if (!clean) return null;
  if (clean === 'student-online-classes') {
    return { tab: clean, inferredMode: 'parent_student' };
  }
  if (VALID_TEACHER_TABS.includes(clean)) {
    return { tab: clean, inferredMode: 'teacher' };
  }
  if (VALID_STUDENT_TABS.includes(clean)) {
    return { tab: clean, inferredMode: 'parent_student' };
  }
  return null;
};

const syncUrlPath = (tab: ActiveNavTab, replace = false) => {
  if (typeof window === 'undefined') return;
  const targetPath = `/${tab}`;
  if (window.location.pathname !== targetPath) {
    if (replace) {
      window.history.replaceState({ tab }, '', targetPath);
    } else {
      window.history.pushState({ tab }, '', targetPath);
    }
  }
};

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialUrlInfo = typeof window !== 'undefined' ? getTabFromPath(window.location.pathname) : null;

  const [userRole, setUserRoleState] = useState<UserRole>(
    initialUrlInfo?.inferredMode === 'parent_student' ? 'student' : 'teacher'
  );
  const [portalMode, setPortalModeState] = useState<PortalMode>(
    initialUrlInfo?.inferredMode === 'parent_student' ? 'parent_student' : 'teacher'
  );
  const [activeTab, setActiveTabState] = useState<ActiveNavTab>(
    initialUrlInfo?.tab || 'dashboard'
  );

  const setActiveTab = (tab: ActiveNavTab) => {
    const allowed = portalMode === 'teacher' ? VALID_TEACHER_TABS : VALID_STUDENT_TABS;
    const targetTab = allowed.includes(tab) ? tab : 'dashboard';
    setActiveTabState(targetTab);
    syncUrlPath(targetTab);
  };

  // Sync with browser back/forward and initial path normalization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initial = getTabFromPath(window.location.pathname);
    if (!initial) {
      // e.g. '/' or unknown route
      syncUrlPath(activeTab, true);
    }

    const handlePopState = () => {
      const parsed = getTabFromPath(window.location.pathname);
      if (parsed) {
        setActiveTabState(parsed.tab);
        if (parsed.inferredMode && parsed.inferredMode !== portalMode) {
          setPortalModeState(parsed.inferredMode);
          setUserRoleState(parsed.inferredMode === 'parent_student' ? 'student' : 'teacher');
        }
      } else {
        setActiveTabState('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [portalMode]);

  const [accommodations, setAccommodations] = useState<StudentAccommodation[]>(initialAccommodations);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'teacher' || role === 'admin' || role === 'coordinator') {
      setPortalModeState('teacher');
      setActiveTabState('dashboard');
      syncUrlPath('dashboard');
      addToast('Role Changed', 'Switched to Teacher role context', 'info');
    } else if (role === 'student') {
      setPortalModeState('parent_student');
      setActiveTabState('dashboard');
      syncUrlPath('dashboard');
      addToast('Role Changed', 'Switched to Student & Parent Portal context', 'info');
    } else if (role === 'proctor') {
      setPortalModeState('teacher');
      setActiveTab('exam-monitoring');
      syncUrlPath('exam-monitoring');
      addToast('Role Changed', 'Switched to Invigilator / Proctor monitoring workspace', 'info');
    }
  };

  const saveAccommodation = (newAcc: StudentAccommodation) => {
    setAccommodations((prev) => {
      const idx = prev.findIndex((a) => a.studentId === newAcc.studentId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newAcc;
        return copy;
      }
      return [...prev, newAcc];
    });
  };

  // Section-Based Exam Creation & Preview State
  const [examSections, setExamSections] = useState<ExamSection[]>(initialExamSections);
  const [showExamPreviewModal, setShowExamPreviewModal] = useState<boolean>(false);

  const addExamSection = (sec: ExamSection) => {
    setExamSections((prev) => [...prev, sec]);
  };

  const updateExamSection = (id: string, updates: Partial<ExamSection>) => {
    setExamSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeExamSection = (id: string) => {
    setExamSections((prev) => prev.filter((s) => s.id !== id));
  };

  // Parent & Child State
  const [parentAccount] = useState<ParentAccount>(initialParentAccount);
  const [selectedChildId, setSelectedChildIdState] = useState<string>(initialParentAccount.children[0]?.id || 's-1');
  const selectedChild = parentAccount.children.find((c) => c.id === selectedChildId) || parentAccount.children[0];

  const [activeStudentExam, setActiveStudentExam] = useState<ScheduledExam | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, { selectedOptionIndex?: number; textAnswer?: string; isMarkedForReview?: boolean }>>({});
  const [studentExamSubmitted, setStudentExamSubmitted] = useState<boolean>(false);
  // Online Classes & Virtual Lectures State
  const [onlineClasses, setOnlineClasses] = useState<OnlineClass[]>(initialOnlineClasses);
  const [activeLiveClass, setActiveLiveClass] = useState<OnlineClass | null>(
    initialOnlineClasses.find((c) => c.status === 'live') || null
  );

  const addOnlineClass = (newClassData: Omit<OnlineClass, 'id' | 'createdAt'>): string => {
    const id = 'cls-' + Date.now().toString(36);
    const newClass: OnlineClass = {
      ...newClassData,
      id,
      createdAt: new Date().toLocaleString(),
    };
    setOnlineClasses((prev) => [newClass, ...prev]);
    addToast('Online Class Created', `"${newClass.title}" scheduled for ${newClass.date} at ${newClass.startTime}`, 'success');
    return id;
  };

  const updateOnlineClass = (id: string, updates: Partial<OnlineClass>) => {
    setOnlineClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (activeLiveClass && activeLiveClass.id === id) {
      setActiveLiveClass((prev) => (prev ? { ...prev, ...updates } : null));
    }
    addToast('Class Updated', 'Online class details have been updated', 'info');
  };

  const deleteOnlineClass = (id: string) => {
    const cls = onlineClasses.find((c) => c.id === id);
    setOnlineClasses((prev) => prev.filter((c) => c.id !== id));
    if (activeLiveClass && activeLiveClass.id === id) {
      setActiveLiveClass(null);
    }
    addToast('Class Deleted', cls ? `"${cls.title}" has been removed.` : 'Class removed.', 'danger');
  };

  const duplicateOnlineClass = (id: string) => {
    const target = onlineClasses.find((c) => c.id === id);
    if (!target) return;
    const newId = 'cls-' + Date.now().toString(36);
    const duplicated: OnlineClass = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      status: 'scheduled',
      liveAttendanceCount: 0,
      createdAt: new Date().toLocaleString(),
    };
    setOnlineClasses((prev) => [duplicated, ...prev]);
    addToast('Class Duplicated', `Created copy of "${target.title}"`, 'success');
  };

  const startLiveClass = (id: string) => {
    const cls = onlineClasses.find((c) => c.id === id);
    if (!cls) return;
    updateOnlineClass(id, { status: 'live' });
    setActiveLiveClass({ ...cls, status: 'live' });
    setActiveTab('live-classroom');
    addToast('Live Class Started', `Broadcast session is now LIVE for "${cls.title}"`, 'success');
  };

  const endLiveClass = (id: string) => {
    updateOnlineClass(id, { status: 'completed' });
    if (activeLiveClass?.id === id) {
      setActiveLiveClass((prev) => (prev ? { ...prev, status: 'completed' } : null));
    }
    addToast('Live Class Concluded', 'Session ended and recorded for student portal review.', 'info');
    setActiveTab('online-classes');
  };

  // Live In-Class Assessment State & Methods
  const [questionPool, setQuestionPool] = useState<PoolQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('online-learning-question-pool-v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed
            .filter(q => q && typeof q.id === 'string' && typeof q.prompt === 'string' && typeof q.subject === 'string' && typeof q.topic === 'string' && q.type !== 'short_answer' && ['mcq', 'mmcq', 'fill_in_blanks', 'match_following', 'step_ordering'].includes(q.type))
            .map(q => ({
              ...q,
              board: q.board || 'CBSE',
              classGrade: q.classGrade || 'Class 10',
              chapter: q.chapter || '',
              bloomsTaxonomy: q.bloomsTaxonomy || 'Apply',
            }));
          if (valid.length > 0) return valid;
        }
      }
    } catch { /* Use starter questions when storage is unavailable or invalid. */ }
    return initialLiveAssessments.flatMap(assessment => assessment.questions.map(q => ({
      ...structuredClone(q),
      id: `pool-${assessment.id}-${q.id}`,
      sectionId: undefined,
      board: q.board || assessment.board || 'CBSE',
      classGrade: q.classGrade || assessment.classGrade || (assessment.targetClass?.includes('12') ? 'Class 12' : assessment.targetClass?.includes('11') ? 'Class 11' : 'Class 10'),
      chapter: q.chapter || assessment.chapter || (assessment.topic?.includes(':') ? assessment.topic.split(':')[0].trim() : assessment.topic),
      subject: assessment.subject,
      topic: assessment.topic,
      difficulty: 'Medium' as const,
      bloomsTaxonomy: q.bloomsTaxonomy || 'Apply' as const,
    })));
  });
  const persistQuestionPool = (next: PoolQuestion[]) => {
    try {
      localStorage.setItem('online-learning-question-pool-v1', JSON.stringify(next));
      setQuestionPool(next);
      return true;
    } catch {
      addToast('Could not save question pool', 'Browser storage is unavailable or full. Please try again.', 'danger');
      return false;
    }
  };
  const savePoolQuestion = (question: PoolQuestion) => persistQuestionPool(
    questionPool.some(q => q.id === question.id)
      ? questionPool.map(q => q.id === question.id ? structuredClone(question) : q)
      : [structuredClone(question), ...questionPool]
  );
  const deletePoolQuestion = (id: string) => persistQuestionPool(questionPool.filter(q => q.id !== id));

  const [liveAssessments, setLiveAssessments] = useState<LiveInClassAssessment[]>(initialLiveAssessments);
  const [activeLiveAssessment, setActiveLiveAssessment] = useState<LiveInClassAssessment | null>(
    initialLiveAssessments[0] || null
  );
  const [editingLiveAssessment, setEditingLiveAssessment] = useState<LiveInClassAssessment | null>(null);
  const [showStudentAssessmentModal, setShowStudentAssessmentModal] = useState<boolean>(false);
  const [showTeacherAssessmentReviewModal, setShowTeacherAssessmentReviewModal] = useState<boolean>(false);
  const [showAssessmentCreatorModal, setShowAssessmentCreatorModal] = useState<boolean>(false);

  // Assessment Link & QR Code Sharing State
  const [sharingAssessment, setSharingAssessment] = useState<LiveInClassAssessment | null>(null);
  const [showShareAssessmentModal, setShowShareAssessmentModal] = useState<boolean>(false);

  const openShareAssessment = (assessment: LiveInClassAssessment) => {
    setSharingAssessment(assessment);
    setShowShareAssessmentModal(true);
  };

  const closeShareAssessment = () => {
    setShowShareAssessmentModal(false);
  };

  // Student Identity Verification (NFC/RFID & Face Scan) State
  const [verifyingAssessment, setVerifyingAssessment] = useState<LiveInClassAssessment | null>(null);
  const [showStudentVerificationModal, setShowStudentVerificationModal] = useState<boolean>(false);
  const [verifiedStudent, setVerifiedStudent] = useState<StudentVerificationProfile | null>(null);

  const openStudentVerification = (assessment: LiveInClassAssessment) => {
    setVerifyingAssessment(assessment);
    setShowStudentVerificationModal(true);
  };

  const completeStudentVerification = (profile: StudentVerificationProfile) => {
    setVerifiedStudent(profile);
    setShowStudentVerificationModal(false);
    if (verifyingAssessment) {
      setActiveLiveAssessment(verifyingAssessment);
    }
    setShowStudentAssessmentModal(true);
    addToast(
      'Identity Verified',
      `Welcome, ${profile.name} (${profile.class}). Authenticated via ${
        profile.verifiedVia === 'nfc'
          ? 'NFC Smart Card'
          : profile.verifiedVia === 'face'
          ? 'Facial Recognition Biometrics'
          : 'Dual Factor (NFC & Face)'
      }.`,
      'success'
    );
  };

  const saveLiveAssessment = (assessment: LiveInClassAssessment) => {
    setLiveAssessments((prev) => {
      const idx = prev.findIndex((a) => a.id === assessment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...assessment };
        return copy;
      }
      return [{ ...assessment }, ...prev];
    });
    addToast(
      'Assessment Saved',
      `"${assessment.title}" has been saved to your Online Class Assessment library.`,
      'success'
    );
  };

  const deleteLiveAssessment = (id: string) => {
    setLiveAssessments((prev) => prev.filter((a) => a.id !== id));
    if (activeLiveAssessment?.id === id) {
      setActiveLiveAssessment(null);
    }
    addToast('Assessment Removed', 'The assessment was deleted from the library.', 'info');
  };

  const duplicateLiveAssessment = (id: string) => {
    const original = liveAssessments.find((a) => a.id === id);
    if (!original) return;
    const duplicated: LiveInClassAssessment = {
      ...original,
      id: 'live-ass-' + Date.now().toString(36),
      title: `${original.title} (Copy)`,
      status: 'draft',
      isDraft: true,
      submissions: [],
      createdAt: new Date().toISOString().split('T')[0],
      launchedAt: undefined,
    };
    setLiveAssessments((prev) => [duplicated, ...prev]);
    addToast('Assessment Duplicated', `Created a copy of "${original.title}".`, 'success');
  };

  const launchLiveAssessment = (assessment: LiveInClassAssessment) => {
    setLiveAssessments((prev) => {
      const idx = prev.findIndex((a) => a.id === assessment.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...assessment,
          status: 'active',
          isDraft: false,
          launchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return copy;
      }
      return [
        {
          ...assessment,
          status: 'active',
          isDraft: false,
          launchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ];
    });
    setActiveLiveAssessment(assessment);
    addToast('Assessment Dispatched', `"${assessment.title}" broadcasted to live classroom chat!`, 'success');
  };

  const launchSavedAssessmentInClass = (assessmentId: string, classId?: string) => {
    const target = liveAssessments.find((a) => a.id === assessmentId);
    if (!target) return;
    const toLaunch: LiveInClassAssessment = {
      ...target,
      classId: classId || activeLiveClass?.id || target.classId || 'cls-101',
      status: 'active',
      isDraft: false,
      launchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    launchLiveAssessment(toLaunch);
  };

  const submitLiveStudentAssessment = (submission: LiveAssessmentSubmission) => {
    setLiveAssessments((prev) =>
      prev.map((ass) => {
        if (ass.id === submission.assessmentId) {
          const filteredSubs = ass.submissions.filter((s) => s.studentId !== submission.studentId);
          return { ...ass, submissions: [submission, ...filteredSubs] };
        }
        return ass;
      })
    );
    if (activeLiveAssessment && activeLiveAssessment.id === submission.assessmentId) {
      setActiveLiveAssessment((prev) => {
        if (!prev) return null;
        const filteredSubs = prev.submissions.filter((s) => s.studentId !== submission.studentId);
        return { ...prev, submissions: [submission, ...filteredSubs] };
      });
    }
    addToast(
      'Assessment Submitted',
      `Score: ${submission.totalScore}/${submission.maxMarks} (${submission.percentage}%)`,
      'success'
    );
  };

  const gradeLiveStudentSubmission = (
    assessmentId: string,
    submissionId: string,
    updates: Partial<LiveAssessmentSubmission>
  ) => {
    setLiveAssessments((prev) =>
      prev.map((ass) => {
        if (ass.id === assessmentId) {
          const updatedSubs = ass.submissions.map((s) =>
            s.id === submissionId ? { ...s, ...updates } : s
          );
          return { ...ass, submissions: updatedSubs };
        }
        return ass;
      })
    );
    if (activeLiveAssessment && activeLiveAssessment.id === assessmentId) {
      setActiveLiveAssessment((prev) => {
        if (!prev) return null;
        const updatedSubs = prev.submissions.map((s) =>
          s.id === submissionId ? { ...s, ...updates } : s
        );
        return { ...prev, submissions: updatedSubs };
      });
    }
    addToast('Evaluation Updated', 'Marks and feedback saved for student.', 'info');
  };

  const closeLiveAssessment = (assessmentId: string) => {
    setLiveAssessments((prev) =>
      prev.map((ass) => (ass.id === assessmentId ? { ...ass, status: 'closed' } : ass))
    );
    if (activeLiveAssessment && activeLiveAssessment.id === assessmentId) {
      setActiveLiveAssessment((prev) => (prev ? { ...prev, status: 'closed' } : null));
    }
    addToast('Assessment Closed', 'Live assessment submissions are now locked.', 'info');
  };

  const publishAssessmentLeaderboard = (assessmentId: string) => {
    const ass = liveAssessments.find((a) => a.id === assessmentId);
    if (!ass) return;
    setLiveAssessments((prev) =>
      prev.map((a) => (a.id === assessmentId ? { ...a, status: 'published' } : a))
    );
    addToast(
      'Scoreboard Published',
      `Shared live assessment solutions & leaderboard with classroom!`,
      'success'
    );
  };

  // Legacy States
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [alerts, setAlerts] = useState<MalpracticeAlert[]>(initialAlerts);
  const [similarityPairs, setSimilarityPairs] = useState<SimilarityPair[]>(initialSimilarityPairs);
  const [rules, setRules] = useState<RuleSetting[]>(initialRules);
  const [activities, setActivities] = useState<ActivityEvent[]>(initialActivities);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<MalpracticeAlert | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSimilarityPair, setSelectedSimilarityPair] = useState<SimilarityPair | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Prototype 02 Creation Form State
  const initialCreateExamForm: ExamBasicDetailsFormData = {
    examName: '',
    examCode: '',
    examType: 'scheduled',
    makeImmediatelyAvailable: true,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    durationMinutes: 60,
    totalMarks: 50,
    passMarks: 20,
    instructions: 'Answer all questions. Do not refresh the page during the examination.',
  };

  const [createExamFormState, setCreateExamFormState] = useState<ExamBasicDetailsFormData>(initialCreateExamForm);

  const updateCreateExamFormState = (updates: Partial<ExamBasicDetailsFormData>) => {
    setCreateExamFormState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamFormState = () => {
    setCreateExamFormState(initialCreateExamForm);
  };

  // Prototype 03 Recipient Selection State
  const initialCreateExamRecipients: ExamRecipientsFormData = {
    selectionMode: 'class_wise',
    academicYear: '2025-2026',
    selectedClass: 'Grade 10',
    selectedDivision: 'Division A',
    selectedStudentIds: ['st-rec-101', 'st-rec-102', 'st-rec-103', 'st-rec-104'],
  };

  const [createExamRecipientsState, setCreateExamRecipientsState] = useState<ExamRecipientsFormData>(initialCreateExamRecipients);

  const updateCreateExamRecipientsState = (updates: Partial<ExamRecipientsFormData>) => {
    setCreateExamRecipientsState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamRecipientsState = () => {
    setCreateExamRecipientsState(initialCreateExamRecipients);
  };

  // Prototype 04 Academic Mapping State
  const initialCreateExamAcademicMapping: ExamAcademicMappingFormData = {
    academicYear: '2025-2026',
    selectedClass: 'Grade 10',
    selectedDivision: 'Division A',
    selectedSubject: 'Mathematics',
    selectedChapterIds: ['ch-math-1', 'ch-math-2', 'ch-math-3'],
  };

  const [createExamAcademicMappingState, setCreateExamAcademicMappingState] = useState<ExamAcademicMappingFormData>(initialCreateExamAcademicMapping);

  const updateCreateExamAcademicMappingState = (updates: Partial<ExamAcademicMappingFormData>) => {
    setCreateExamAcademicMappingState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamAcademicMappingState = () => {
    setCreateExamAcademicMappingState(initialCreateExamAcademicMapping);
  };

  // Prototype 05 Question Source State
  const initialCreateExamQuestionSource: ExamQuestionSourceFormData = {
    sourceType: 'existing_pool',
  };

  const [createExamQuestionSourceState, setCreateExamQuestionSourceState] = useState<ExamQuestionSourceFormData>(initialCreateExamQuestionSource);

  const updateCreateExamQuestionSourceState = (updates: Partial<ExamQuestionSourceFormData>) => {
    setCreateExamQuestionSourceState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamQuestionSourceState = () => {
    setCreateExamQuestionSourceState(initialCreateExamQuestionSource);
  };

  // Prototype 06 Question Type & Marks Distribution State
  const initialCreateExamMarksDistribution: ExamMarksDistributionFormData = {
    rows: [
      { type: 'mcq', label: 'MCQ (Multiple Choice)', questionCount: 10, marksPerQuestion: 1, totalMarks: 10 },
      { type: 'one_word', label: 'One Word', questionCount: 5, marksPerQuestion: 1, totalMarks: 5 },
      { type: 'short_answer', label: 'Short Answer', questionCount: 5, marksPerQuestion: 2, totalMarks: 10 },
      { type: 'long_answer', label: 'Long Answer', questionCount: 2, marksPerQuestion: 5, totalMarks: 10 },
      { type: 'essay', label: 'Essay', questionCount: 1, marksPerQuestion: 15, totalMarks: 15 },
    ],
    totalQuestions: 23,
    calculatedTotalMarks: 50,
  };

  const [createExamMarksDistributionState, setCreateExamMarksDistributionState] = useState<ExamMarksDistributionFormData>(initialCreateExamMarksDistribution);

  const updateCreateExamMarksDistributionState = (updates: Partial<ExamMarksDistributionFormData>) => {
    setCreateExamMarksDistributionState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamMarksDistributionState = () => {
    setCreateExamMarksDistributionState(initialCreateExamMarksDistribution);
  };

  // Prototype 07 & 08 Question Bank Browser State
  const initialCreateExamQuestionBank: ExamQuestionBankFormData = {
    selectionMode: 'manual',
    selectedQuestionIds: [
      'qb-m1', 'qb-m2', 'qb-m3', 'qb-m4', 'qb-m5', 'qb-m6', 'qb-m7', 'qb-m8', 'qb-m9', 'qb-m10',
      'qb-m13', 'qb-m14', 'qb-m15', 'qb-m16', 'qb-m17',
      'qb-m18', 'qb-m19', 'qb-m20', 'qb-m21', 'qb-m22',
      'qb-m23', 'qb-m24',
      'qb-m26',
    ],
    isLocked: false,
    randomSeed: 101,
  };

  const [createExamQuestionBankState, setCreateExamQuestionBankState] = useState<ExamQuestionBankFormData>(initialCreateExamQuestionBank);

  const updateCreateExamQuestionBankState = (updates: Partial<ExamQuestionBankFormData>) => {
    setCreateExamQuestionBankState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamQuestionBankState = () => {
    setCreateExamQuestionBankState(initialCreateExamQuestionBank);
  };

  // Prototype 09 PDF Question Paper Setup State
  const initialCreateExamPdfSetup: ExamPdfSetupFormData = {
    fileName: 'Grade10_Mathematics_Midterm_Paper.pdf',
    fileSize: 4404019, // ~4.2 MB
    pageCount: 6,
    uploadDate: '2026-08-11',
    fileUrl: '/mock/Grade10_Mathematics_Midterm_Paper.pdf',
    totalMarks: 50,
    questionCount: 20,
    durationMinutes: 90,
    submissionType: 'omr',
    isOfficialNonEditablePaper: true,
  };

  const [createExamPdfSetupState, setCreateExamPdfSetupState] = useState<ExamPdfSetupFormData>(initialCreateExamPdfSetup);

  const updateCreateExamPdfSetupState = (updates: Partial<ExamPdfSetupFormData>) => {
    setCreateExamPdfSetupState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamPdfSetupState = () => {
    setCreateExamPdfSetupState(initialCreateExamPdfSetup);
  };

  // Prototype 10 Answer Submission Configuration State
  const initialCreateExamAnswerSubmissionConfig: ExamAnswerSubmissionConfigFormData = {
    enableTextAnswer: true,
    enableAttachmentAnswer: true,
    allowedFormats: ['pdf', 'jpg', 'png', 'doc'],
    maxAttachmentSizeMb: 10,
    maxAttachmentsPerQuestion: 3,
    typeRules: [
      { type: 'mcq', label: 'MCQ (Multiple Choice)', allowTextAnswer: false, allowAttachment: false, editorMode: 'plain' },
      { type: 'one_word', label: 'One Word', allowTextAnswer: true, allowAttachment: false, editorMode: 'plain', maxWordCount: 5 },
      { type: 'short_answer', label: 'Short Answer', allowTextAnswer: true, allowAttachment: true, editorMode: 'plain', maxWordCount: 100 },
      { type: 'long_answer', label: 'Long Answer', allowTextAnswer: true, allowAttachment: true, editorMode: 'rich', maxWordCount: 500 },
      { type: 'essay', label: 'Essay', allowTextAnswer: true, allowAttachment: true, editorMode: 'rich', maxWordCount: 1500 },
    ],
  };

  const [createExamAnswerSubmissionConfigState, setCreateExamAnswerSubmissionConfigState] = useState<ExamAnswerSubmissionConfigFormData>(initialCreateExamAnswerSubmissionConfig);

  const updateCreateExamAnswerSubmissionConfigState = (updates: Partial<ExamAnswerSubmissionConfigFormData>) => {
    setCreateExamAnswerSubmissionConfigState((prev) => ({ ...prev, ...updates }));
  };

  const resetCreateExamAnswerSubmissionConfigState = () => {
    setCreateExamAnswerSubmissionConfigState(initialCreateExamAnswerSubmissionConfig);
  };

  // New Teacher Module States
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>(initialQuestionPapers);
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>(initialScheduledExams);
  const [studentUploadedFiles, setStudentUploadedFiles] = useState<
    Record<string, Array<{ id: string; fileName: string; fileSize: string; fileUrl: string; uploadedAt: string; fileType: string }>>
  >({});

  const addQuestionPaper = (paper: QuestionPaper) => {
    setQuestionPapers((prev) => [paper, ...prev]);
  };

  const uploadStudentFile = (key: string, fileInfo: { fileName: string; fileSize: string; fileUrl: string; fileType: string }) => {
    const newFile = {
      id: 'st-file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ...fileInfo,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setStudentUploadedFiles((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), newFile],
    }));
    addToast('File Uploaded Successfully', `Uploaded ${fileInfo.fileName} (${fileInfo.fileSize})`, 'success');
  };

  const removeStudentFile = (key: string, fileId: string) => {
    setStudentUploadedFiles((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((f) => f.id !== fileId),
    }));
    addToast('Attachment Removed', 'File removed from submission list.', 'info');
  };
  const [selectedExamId, setSelectedExamId] = useState<string>('exam-101');
  const [monitoringStudents, setMonitoringStudents] = useState<MonitoringStudent[]>(initialMonitoringStudents);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>(initialLiveAlerts);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>(initialSubmissions);
  const [resultSettings, setResultSettings] = useState<ResultSettings>(initialResultSettings);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(initialRecentActivities);

  // Prototype 22 Evaluation Dashboard State
  const [evaluationDashboardItems, setEvaluationDashboardItems] = useState<EvaluationDashboardItem[]>(mockEvaluationDashboardItems);

  // Prototype 23 Answer Evaluation State
  const [activeEvaluationAttempt, setActiveEvaluationAttempt] = useState<StudentAttemptEvaluationSession>(mockStudentEvaluationAttempt);

  // Prototype 24 Attachment Evaluation State
  const [attachmentRecords, setAttachmentRecords] = useState<AttachmentEvaluationRecord[]>(mockAttachmentEvaluationRecords);
  const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number>(0);

  // Prototype 25 Result Calculation & Review State
  const [candidateResultSummary, setCandidateResultSummary] = useState<CandidateResultCalculationSummary>(mockCandidateResultSummary);

  // Modals & Selection
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<MonitoringStudent | null>(null);
  const [selectedSubmissionForEvaluation, setSelectedSubmissionForEvaluation] = useState<StudentSubmission | null>(null);
  const [selectedStudentResultPreview, setSelectedStudentResultPreview] = useState<StudentSubmission | null>(null);

  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [previewQuestionPaper, setPreviewQuestionPaper] = useState<QuestionPaper | null>(null);
  const [showPublishConfirmationModal, setShowPublishConfirmationModal] = useState<boolean>(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);

  const [liveSimulationActive, setLiveSimulationActive] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
    setUserRoleState(mode === 'teacher' ? 'teacher' : 'student');
    setActiveTabState('dashboard');
    syncUrlPath('dashboard');
    if (mode === 'parent_student') {
      addToast('Parent & Student Portal Activated', `Viewing as ${parentAccount.parentName}`, 'info');
    } else {
      addToast('Teacher Portal Activated', 'Switched to Teacher Online Class Portal', 'info');
    }
  };

  const setSelectedChildId = (childId: string) => {
    setSelectedChildIdState(childId);
    const child = parentAccount.children.find((c) => c.id === childId);
    if (child) {
      addToast('Child Profile Switched', `Active Student: ${child.name} (${child.class})`, 'success');
    }
  };

  const saveStudentAnswer = (
    questionId: string,
    answer: { selectedOptionIndex?: number; textAnswer?: string; isMarkedForReview?: boolean }
  ) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...answer },
    }));
  };

  const submitStudentExam = (examId: string) => {
    setStudentExamSubmitted(true);
    addToast('Exam Submitted Successfully!', 'Your answers have been uploaded for evaluation.', 'success');

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === selectedChild.id ? { ...s, examStatus: 'submitted', questionsRemaining: 0 } : s))
    );

    setRecentActivities((prev) => [
      {
        id: 'act-' + Date.now(),
        title: `${selectedChild.name} (${selectedChild.rollNo}) submitted online exam session`,
        timestamp: 'Just now',
        category: 'assessment',
        badgeType: 'success',
      },
      ...prev,
    ]);
  };

  // Legacy actions
  const updateAlertStatus = (alertId: string, status: MalpracticeAlert['status'], notes?: string, reviewerName: string = 'Dr. Arshad Khan') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status, reviewerNotes: notes || a.reviewerNotes, reviewerName } : a))
    );
    addToast('Alert Updated', `Alert ${alertId} marked as ${status}`, 'success');
  };

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateRuleConfig = (ruleId: string, updates: Partial<RuleSetting>) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  const addNewExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
  };

  const triggerMockViolation = () => {
    addToast('AI Violation Triggered', 'Simulated real-time computer vision flag', 'warning');
  };

  const terminateStudentSession = (studentId: string) => {
    addToast('Session Terminated', 'Terminated student session', 'danger');
  };

  // Live simulation for monitoring
  useEffect(() => {
    if (!liveSimulationActive || portalMode !== 'teacher') return;

    const timer = setInterval(() => {
      const activeList = monitoringStudents.filter((s) => s.examStatus === 'active' || s.examStatus === 'warning');
      if (activeList.length === 0) return;

      const randomStudent = activeList[Math.floor(Math.random() * activeList.length)];
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newCount = randomStudent.tabSwitchCount + 1;

      setMonitoringStudents((prev) =>
        prev.map((s) =>
          s.id === randomStudent.id
            ? {
                ...s,
                tabSwitchCount: newCount,
                warningCount: s.warningCount + 1,
                examStatus: newCount >= 3 ? 'suspicious' : 'warning',
                lastActivity: 'Just now',
                tabSwitchEvents: [
                  { timestamp: nowStr, details: `Tab switched to external app (${newCount}th violation)` },
                  ...s.tabSwitchEvents,
                ],
              }
            : s
        )
      );

      setLiveAlerts((prev) => [
        {
          id: 'alt-' + Date.now(),
          studentId: randomStudent.id,
          studentName: randomStudent.name,
          rollNo: randomStudent.rollNo,
          alertType: 'tab_switch',
          severity: newCount >= 3 ? 'danger' : 'warning',
          message: `${randomStudent.name} switched browser tab (Violation #${newCount})`,
          timestamp: nowStr,
        },
        ...prev,
      ]);
    }, 9000);

    return () => clearInterval(timer);
  }, [liveSimulationActive, monitoringStudents, portalMode]);

  // Actions for Exam Scheduling
  const scheduleNewExam = (exam: ScheduledExam) => {
    setScheduledExams((prev) => [exam, ...prev]);
    addToast('Exam Scheduled Successfully!', `${exam.title} scheduled for ${exam.examDate}`, 'success');
  };

  const publishCurrentExam = () => {
    const newExamId = 'ex-' + Date.now();
    const isSpot = createExamFormState.examType === 'spot';
    const isPdfBranch = createExamQuestionSourceState.sourceType === 'upload_pdf';
    const examCodeStr = createExamFormState.examCode || 'EXAM-' + Math.floor(Math.random() * 9000 + 1000);
    const examTitleStr = createExamFormState.examName || 'Assessment';
    
    const newExam: ScheduledExam = {
      id: newExamId,
      title: examTitleStr,
      examType: isSpot ? 'Quiz' : 'Midterm',
      subject: createExamAcademicMappingState.selectedSubject || 'Mathematics',
      class: createExamRecipientsState.selectedClass || 'Grade 10',
      section: createExamRecipientsState.selectedDivision || 'Division A',
      academicYear: createExamRecipientsState.academicYear || '2025-2026',
      semester: 'Semester 1',
      questionPaperId: 'qp-' + Date.now(),
      questionPaperCode: examCodeStr,
      totalQuestions: createExamMarksDistributionState.totalQuestions || 23,
      maxMarks: Number(createExamFormState.totalMarks) || 50,
      paperType: isPdfBranch ? 'uploaded' : 'existing',
      assignmentType: createExamRecipientsState.selectionMode === 'class_wise' ? 'entire_class' : 'individual',
      assignedStudentIds: createExamRecipientsState.selectedStudentIds,
      studentCount: createExamRecipientsState.selectionMode === 'class_wise' ? 38 : createExamRecipientsState.selectedStudentIds.length,
      examDate: createExamFormState.startDate || new Date().toISOString().split('T')[0],
      startTime: createExamFormState.startTime || '09:00 AM',
      endTime: createExamFormState.endTime || '10:30 AM',
      durationMinutes: Number(createExamFormState.durationMinutes) || 90,
      timeZone: 'IST (UTC+05:30)',
      lateEntryAllowed: true,
      lateEntryLimitMinutes: 15,
      instructions: createExamFormState.instructions || 'All questions are mandatory.',
      passMarks: Number(createExamFormState.passMarks) || 20,
      controls: {
        randomizeQuestions: false,
        randomizeOptions: false,
        preventCopyPaste: true,
        fullScreenMode: true,
        detectTabSwitching: true,
        autoSubmitOnTimeEnd: true,
        allowResume: true,
        showTimer: true,
        allowCalculator: true,
        allowReviewBeforeSubmit: true,
      },
      status: isSpot ? 'live' : 'scheduled',
    };

    setScheduledExams((prev) => [newExam, ...prev]);
    addToast(
      'Exam Published Successfully!',
      `Published ${newExam.title} (${newExam.questionPaperCode}). Exam status is now ${newExam.status.toUpperCase()}.`,
      'success'
    );
    setActiveTab('exam-scheduling');
  };

  const updateExamStatus = (examId: string, status: ScheduledExam['status']) => {
    setScheduledExams((prev) => prev.map((e) => (e.id === examId ? { ...e, status } : e)));
  };

  const duplicateExam = (examId: string) => {
    const original = scheduledExams.find((e) => e.id === examId);
    if (!original) return;
    const copy: ScheduledExam = { ...original, id: 'exam-' + Date.now(), title: `${original.title} (Copy)`, status: 'draft' };
    setScheduledExams((prev) => [copy, ...prev]);
    addToast('Exam Duplicated', `Created draft copy of ${original.title}`, 'success');
  };

  const deleteExam = (examId: string) => {
    setScheduledExams((prev) => prev.filter((e) => e.id !== examId));
    addToast('Exam Cancelled', 'Exam removed from list', 'warning');
  };

  // Monitoring Actions
  const sendWarningToStudent = (studentId: string, message: string) => {
    const student = monitoringStudents.find((s) => s.id === studentId);
    if (!student) return;
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, warningCount: s.warningCount + 1 } : s))
    );
    addToast('Warning Issued', `Dispatched warning to ${student.name}`, 'warning');
  };

  const pauseStudentExam = (studentId: string) => {
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, examStatus: 'warning', connectionStatus: 'unstable' } : s))
    );
    addToast('Exam Paused', 'Session paused', 'warning');
  };

  const resumeStudentExam = (studentId: string) => {
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, examStatus: 'active', connectionStatus: 'connected' } : s))
    );
    addToast('Exam Resumed', 'Session resumed', 'success');
  };

  const addExtraTime = (studentId: string, extraMinutes: number) => {
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, timeRemainingMinutes: s.timeRemainingMinutes + extraMinutes } : s))
    );
    addToast('Time Extended', `Granted +${extraMinutes} minutes`, 'success');
  };

  const forceSubmitStudent = (studentId: string) => {
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, examStatus: 'submitted', questionsRemaining: 0 } : s))
    );
    addToast('Force Submitted', 'Candidate answer sheet submitted.', 'success');
  };

  const terminateStudentExam = (studentId: string) => {
    setMonitoringStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, examStatus: 'suspicious', connectionStatus: 'disconnected' } : s))
    );
    addToast('Exam Terminated', 'Session terminated.', 'danger');
  };

  const broadcastAnnouncement = (target: 'all' | 'selected', message: string) => {
    addToast('Announcement Broadcast', `Sent banner message to candidates`, 'info');
    setShowBroadcastModal(false);
  };

  // Assessment Actions
  const saveAnswerGrading = (submissionId: string, questionId: string, updates: Partial<AnswerGradeDetail>) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;

        const currentAnswer = sub.answers[questionId] || {
          questionId,
          studentAnswerText: '',
          isObjective: false,
          awardedScore: 0,
          maxMarks: 15,
        };

        const updatedAnswer = { ...currentAnswer, ...updates };
        const updatedAnswers = { ...sub.answers, [questionId]: updatedAnswer };

        let newSubjective = 0;
        let newObjective = 0;

        Object.values(updatedAnswers).forEach((ans) => {
          if (ans.isObjective) newObjective += ans.awardedScore;
          else newSubjective += ans.awardedScore;
        });

        const newTotal = newObjective + newSubjective;
        const newPct = Math.round((newTotal / sub.maxMarks) * 100);

        let newGrade = 'F';
        if (newPct >= 90) newGrade = 'A+';
        else if (newPct >= 80) newGrade = 'A';
        else if (newPct >= 70) newGrade = 'B+';
        else if (newPct >= 60) newGrade = 'B';
        else if (newPct >= 50) newGrade = 'C';
        else if (newPct >= 40) newGrade = 'D';

        const updatedSub: StudentSubmission = {
          ...sub,
          answers: updatedAnswers,
          objectiveMarks: newObjective,
          subjectiveMarks: newSubjective,
          totalMarks: newTotal,
          percentage: newPct,
          grade: newGrade,
          resultStatus: newPct >= 40 ? 'pass' : 'fail',
          evaluationStatus: sub.evaluationStatus === 'pending' ? 'in_review' : sub.evaluationStatus,
        };

        if (selectedSubmissionForEvaluation?.id === submissionId) {
          setSelectedSubmissionForEvaluation(updatedSub);
        }

        return updatedSub;
      })
    );

    addToast('Marks Saved', 'Evaluation saved successfully', 'success');
  };

  const reEvaluateSubmission = (submissionId: string, reason: string) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, evaluationStatus: 'in_review' } : sub))
    );
    addToast('Re-evaluation Mode', `Submission placed in review: ${reason}`, 'warning');
  };

  const finalizeSubmissionAssessment = (submissionId: string) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => (sub.id === submissionId ? { ...sub, evaluationStatus: 'finalized', publishStatus: 'ready' } : sub))
    );
    addToast('Assessment Finalized', 'Student marks locked and ready for publish.', 'success');
  };

  const bulkFinalizeAssessments = (examId: string) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => (sub.examId === examId ? { ...sub, evaluationStatus: 'finalized', publishStatus: 'ready' } : sub))
    );
    addToast('Bulk Finalization', 'All submissions finalized.', 'success');
  };

  // Result Actions
  const updateResultSettings = (settings: Partial<ResultSettings>) => {
    setResultSettings((prev) => ({ ...prev, ...settings }));
    addToast('Result Settings Saved', 'Publish rules updated.', 'success');
  };

  const publishExamResults = (examId: string, options: { notifyApp: boolean; notifyEmail: boolean; notifyParent: boolean }) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => (sub.examId === examId || examId === 'all' || !examId ? { ...sub, publishStatus: 'published' } : sub))
    );
    setEvaluationDashboardItems((prev) =>
      prev.map((item) => {
        if (item.examId === examId || examId === 'all' || !examId) {
          return { ...item, evaluationStatus: 'Published' };
        }
        return item;
      })
    );
    setShowPublishConfirmationModal(false);
    addToast(
      'Results Published Successfully!',
      `Official result cards are now published and visible to students on their portal (${options.notifyApp ? 'Push' : ''}${options.notifyEmail ? ', Email' : ''}${options.notifyParent ? ', Parent SMS' : ''}).`,
      'success'
    );
  };

  const unpublishExamResults = (examId: string) => {
    setStudentSubmissions((prev) =>
      prev.map((sub) => (sub.examId === examId || examId === 'all' || !examId ? { ...sub, publishStatus: 'draft' } : sub))
    );
    setEvaluationDashboardItems((prev) =>
      prev.map((item) => {
        if (item.examId === examId || examId === 'all' || !examId) {
          return { ...item, evaluationStatus: 'Completed' };
        }
        return item;
      })
    );
    addToast('Results Recalled (Draft Status)', 'Results set back to draft mode. Marks hidden from student view.', 'info');
  };

  const checkExamPublishBlocked = (examId: string): EvaluationDashboardItem[] => {
    return evaluationDashboardItems.filter(
      (item) =>
        (item.examId === examId || examId === 'all' || !examId) &&
        (item.evaluationStatus === 'Not Started' || item.evaluationStatus === 'In Progress')
    );
  };

  // Prototype 22 Evaluation Dashboard Methods
  const updateEvaluationDashboardItemStatus = (
    id: string,
    status: PRDEvaluationStatus,
    obtainedMarks?: number | null,
    feedback?: string
  ) => {
    setEvaluationDashboardItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newMarks = obtainedMarks !== undefined ? obtainedMarks : item.obtainedMarks;
          const percentage = newMarks !== null && newMarks !== undefined ? Math.round((newMarks / item.maxMarks) * 100) : item.percentage;
          return {
            ...item,
            evaluationStatus: status,
            obtainedMarks: newMarks,
            percentage,
            feedback: feedback !== undefined ? feedback : item.feedback,
            evaluator: status !== 'Not Started' ? (item.evaluator === 'Unassigned' ? 'Prof. Sarah Jenkins' : item.evaluator) : item.evaluator,
          };
        }
        return item;
      })
    );
    addToast('Status Updated', `Evaluation status updated to "${status}".`, 'success');
  };

  const bulkPublishEvaluationDashboardItems = (ids?: string[]) => {
    setEvaluationDashboardItems((prev) =>
      prev.map((item) => {
        if (!ids || ids.includes(item.id)) {
          if (item.evaluationStatus === 'Completed') {
            return { ...item, evaluationStatus: 'Published' };
          }
        }
        return item;
      })
    );
    addToast('Bulk Publish Success', 'Completed evaluations published successfully.', 'success');
  };

  // Prototype 23 Answer Evaluation Methods
  const updateQuestionAwardedMarks = (questionId: string, marks: number, remarks?: string) => {
    setActiveEvaluationAttempt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id === questionId) {
          const validMarks = Math.min(Math.max(0, marks), q.maxMarks);
          return {
            ...q,
            awardedMarks: validMarks,
            teacherRemarks: remarks !== undefined ? remarks : q.teacherRemarks,
          };
        }
        return q;
      }),
    }));
  };

  const navigateAttemptQuestion = (target: 'next' | 'prev' | number) => {
    setActiveEvaluationAttempt((prev) => {
      let nextIndex = prev.currentQuestionIndex;
      if (typeof target === 'number') {
        nextIndex = Math.min(Math.max(0, target), prev.questions.length - 1);
      } else if (target === 'next') {
        nextIndex = Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1);
      } else if (target === 'prev') {
        nextIndex = Math.max(prev.currentQuestionIndex - 1, 0);
      }
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  };

  const completeAttemptEvaluation = () => {
    const totalAwarded = activeEvaluationAttempt.questions.reduce((acc, q) => acc + q.awardedMarks, 0);
    updateEvaluationDashboardItemStatus(
      activeEvaluationAttempt.submissionId === 'sub-101' ? 'eval-101' : activeEvaluationAttempt.submissionId,
      'Completed',
      totalAwarded,
      'Full attempt evaluation completed.'
    );
    addToast('Evaluation Completed', `Total marks locked at ${totalAwarded}/${activeEvaluationAttempt.maxMarks}.`, 'success');
    setActiveTab('evaluation-dashboard');
  };

  // Prototype 24 Attachment Evaluation Methods
  const updateAttachmentMarksAndRemarks = (recordId: string, marks: number, remarks: string) => {
    setAttachmentRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          const validMarks = Math.min(Math.max(0, marks), rec.maxMarks);
          return { ...rec, awardedMarks: validMarks, teacherRemarks: remarks };
        }
        return rec;
      })
    );
    addToast('Attachment Saved', 'Marks and remarks updated for attachment.', 'success');
  };

  const addVisualAnnotationMark = (
    recordId: string,
    annotation: Omit<VisualAnnotationMark, 'id' | 'createdAt'>
  ) => {
    const newMark: VisualAnnotationMark = {
      ...annotation,
      id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      createdAt: 'Just now',
    };

    setAttachmentRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return { ...rec, annotations: [...rec.annotations, newMark] };
        }
        return rec;
      })
    );
  };

  const clearVisualAnnotations = (recordId: string) => {
    setAttachmentRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recordId) {
          return { ...rec, annotations: [] };
        }
        return rec;
      })
    );
    addToast('Annotations Cleared', 'Visual stamps removed from document canvas.', 'info');
  };

  const navigateAttachmentRecord = (target: 'next' | 'prev' | number) => {
    setActiveAttachmentIndex((prev) => {
      if (typeof target === 'number') {
        return Math.min(Math.max(0, target), attachmentRecords.length - 1);
      }
      if (target === 'next') {
        return Math.min(prev + 1, attachmentRecords.length - 1);
      }
      if (target === 'prev') {
        return Math.max(prev - 1, 0);
      }
      return prev;
    });
  };

  // Prototype 25 Result Calculation & Review Methods
  const updatePassMarkThresholdPct = (newPassMarkPct: number) => {
    setCandidateResultSummary((prev) => {
      const isPassed = prev.percentage >= newPassMarkPct;
      return {
        ...prev,
        passMarkPercentage: newPassMarkPct,
        isPassed,
      };
    });
    addToast('Threshold Updated', `Minimum pass mark updated to ${newPassMarkPct}%.`, 'info');
  };

  const publishCandidateResultSummary = () => {
    updateEvaluationDashboardItemStatus(
      candidateResultSummary.submissionId === 'sub-101' ? 'eval-101' : candidateResultSummary.submissionId,
      'Published'
    );
    addToast('Result Published!', `Official result for ${candidateResultSummary.studentName} is now live in student portal.`, 'success');
    setActiveTab('evaluation-dashboard');
  };

  return (
    <ExamContext.Provider
      value={{
        userRole,
        setUserRole,
        portalMode,
        setPortalMode,
        activeTab,
        setActiveTab,

        accommodations,
        saveAccommodation,

        examSections,
        setExamSections,
        addExamSection,
        updateExamSection,
        removeExamSection,
        showExamPreviewModal,
        setShowExamPreviewModal,

        parentAccount,
        selectedChild,
        setSelectedChildId,
        activeStudentExam,
        setActiveStudentExam,
        studentAnswers,
        saveStudentAnswer,
        submitStudentExam,
        studentExamSubmitted,
        setStudentExamSubmitted,

        students,
        exams,
        alerts,
        similarityPairs,
        rules,
        activities,
        selectedStudent,
        setSelectedStudent,
        selectedAlert,
        setSelectedAlert,
        selectedExam,
        setSelectedExam,
        selectedSimilarityPair,
        setSelectedSimilarityPair,
        demoMode,
        setDemoMode,
        updateAlertStatus,
        toggleRule,
        updateRuleConfig,
        addNewExam,
        publishCurrentExam,
        triggerMockViolation,
        terminateStudentSession,

        createExamFormState,
        setCreateExamFormState,
        updateCreateExamFormState,
        resetCreateExamFormState,

        createExamRecipientsState,
        setCreateExamRecipientsState,
        updateCreateExamRecipientsState,
        resetCreateExamRecipientsState,

        createExamAcademicMappingState,
        setCreateExamAcademicMappingState,
        updateCreateExamAcademicMappingState,
        resetCreateExamAcademicMappingState,

        createExamQuestionSourceState,
        setCreateExamQuestionSourceState,
        updateCreateExamQuestionSourceState,
        resetCreateExamQuestionSourceState,

        createExamMarksDistributionState,
        setCreateExamMarksDistributionState,
        updateCreateExamMarksDistributionState,
        resetCreateExamMarksDistributionState,

        createExamQuestionBankState,
        setCreateExamQuestionBankState,
        updateCreateExamQuestionBankState,
        resetCreateExamQuestionBankState,

        createExamPdfSetupState,
        setCreateExamPdfSetupState,
        updateCreateExamPdfSetupState,
        resetCreateExamPdfSetupState,

        createExamAnswerSubmissionConfigState,
        setCreateExamAnswerSubmissionConfigState,
        updateCreateExamAnswerSubmissionConfigState,
        resetCreateExamAnswerSubmissionConfigState,

        questionPapers,
        addQuestionPaper,
        studentUploadedFiles,
        uploadStudentFile,
        removeStudentFile,
        scheduledExams,
        selectedExamId,
        setSelectedExamId,
        monitoringStudents,
        liveAlerts,
        studentSubmissions,
        resultSettings,
        recentActivities,

        evaluationDashboardItems,
        setEvaluationDashboardItems,
        updateEvaluationDashboardItemStatus,
        bulkPublishEvaluationDashboardItems,

        activeEvaluationAttempt,
        setActiveEvaluationAttempt,
        updateQuestionAwardedMarks,
        navigateAttemptQuestion,
        completeAttemptEvaluation,

        attachmentRecords,
        activeAttachmentIndex,
        setActiveAttachmentIndex,
        updateAttachmentMarksAndRemarks,
        addVisualAnnotationMark,
        clearVisualAnnotations,
        navigateAttachmentRecord,

        candidateResultSummary,
        setCandidateResultSummary,
        updatePassMarkThresholdPct,
        publishCandidateResultSummary,

        selectedStudentForDrawer,
        setSelectedStudentForDrawer,
        selectedSubmissionForEvaluation,
        setSelectedSubmissionForEvaluation,
        selectedStudentResultPreview,
        setSelectedStudentResultPreview,

        showScheduleModal,
        setShowScheduleModal,
        previewQuestionPaper,
        setPreviewQuestionPaper,
        showPublishConfirmationModal,
        setShowPublishConfirmationModal,
        showBroadcastModal,
        setShowBroadcastModal,

        liveSimulationActive,
        setLiveSimulationActive,
        toasts,
        addToast,
        removeToast,

        // Online Classes & Virtual Lectures
        onlineClasses,
        activeLiveClass,
        setActiveLiveClass,
        addOnlineClass,
        updateOnlineClass,
        deleteOnlineClass,
        duplicateOnlineClass,
        startLiveClass,
        endLiveClass,

        // Live In-Class Assessment
        questionPool,
        savePoolQuestion,
        deletePoolQuestion,
        liveAssessments,
        activeLiveAssessment,
        setActiveLiveAssessment,
        editingLiveAssessment,
        setEditingLiveAssessment,
        saveLiveAssessment,
        deleteLiveAssessment,
        duplicateLiveAssessment,
        launchLiveAssessment,
        launchSavedAssessmentInClass,
        submitLiveStudentAssessment,
        gradeLiveStudentSubmission,
        closeLiveAssessment,
        publishAssessmentLeaderboard,
        showStudentAssessmentModal,
        setShowStudentAssessmentModal,
        showTeacherAssessmentReviewModal,
        setShowTeacherAssessmentReviewModal,
        showAssessmentCreatorModal,
        setShowAssessmentCreatorModal,

        // Assessment Link & QR Code Sharing
        sharingAssessment,
        setSharingAssessment,
        showShareAssessmentModal,
        setShowShareAssessmentModal,
        openShareAssessment,
        closeShareAssessment,

        // Student Identity Verification (NFC/RFID & Face Scan)
        verifyingAssessment,
        setVerifyingAssessment,
        showStudentVerificationModal,
        setShowStudentVerificationModal,
        verifiedStudent,
        setVerifiedStudent,
        openStudentVerification,
        completeStudentVerification,

        scheduleNewExam,
        updateExamStatus,
        duplicateExam,
        deleteExam,

        sendWarningToStudent,
        pauseStudentExam,
        resumeStudentExam,
        addExtraTime,
        forceSubmitStudent,
        terminateStudentExam,
        broadcastAnnouncement,

        saveAnswerGrading,
        reEvaluateSubmission,
        finalizeSubmissionAssessment,
        bulkFinalizeAssessments,

        updateResultSettings,
        publishExamResults,
        unpublishExamResults,
        checkExamPublishBlocked,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
