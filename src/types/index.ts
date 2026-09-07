// Legacy Proctoring & Risk Types
export type RiskLevel = 'normal' | 'low_risk' | 'warning' | 'high_risk';
export type StudentStatus = 'normal' | 'low_risk' | 'warning' | 'high_risk' | 'under_review' | 'confirmed' | 'dismissed' | 'technical_issue';
export type ConnectionStatus = 'connected' | 'unstable' | 'disconnected';

export interface Student {
  id: string;
  name: string;
  admissionNo: string;
  photoUrl: string;
  class: string;
  department: string;
  riskScore: number;
  status: StudentStatus;
  currentExam: string;
  activeQuestion: number;
  totalQuestions: number;
  progressPct: number;
  lastViolation?: string;
  lastEventTime?: string;
  device: string;
  browser: string;
  ip: string;
  loginTime: string;
  connectionStatus: ConnectionStatus;
  cameraStatus: 'active' | 'disabled' | 'blocked';
  micStatus: 'active' | 'disabled' | 'muted';
  screenShareStatus: 'active' | 'stopped' | 'not_started';
  faceStatus: 'present' | 'missing' | 'multiple';
  faceCount: number;
  gazeStatus: 'looking_center' | 'looking_away';
  audioLevel: number;
  voiceActivity: boolean;
  fullScreenCompliant: boolean;
  networkStrength: number;
  googleMeetUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  classDept: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalRegistered: number;
  onlineCount: number;
  flaggedCount: number;
  highRiskCount: number;
  status: 'active' | 'upcoming' | 'completed' | 'paused';
  fullScreenCompliancePct: number;
  progressPct: number;
}

export type ViolationType =
  | 'Tab switch'
  | 'Full-screen exit'
  | 'No face detected'
  | 'Multiple faces detected'
  | 'Mobile phone detected'
  | 'Another person detected'
  | 'Multiple voices detected'
  | 'Camera disabled'
  | 'Microphone disabled'
  | 'Screen sharing stopped'
  | 'Identity mismatch'
  | 'Multiple login sessions'
  | 'Suspicious answer pattern'
  | 'Unusual completion speed';

export interface AuditEntry {
  id: string;
  action: string;
  reviewer: string;
  timestamp: string;
  comment?: string;
}

export interface MalpracticeAlert {
  id: string;
  alertCode: string;
  studentId: string;
  studentName: string;
  studentPhoto: string;
  admissionNo: string;
  examId: string;
  examTitle: string;
  violationType: ViolationType;
  riskPoints: number;
  confidenceScore: number;
  timestamp: string;
  status: 'new' | 'under_review' | 'confirmed' | 'dismissed' | 'warning_sent';
  evidenceAvailable: boolean;
  evidenceType: 'webcam' | 'screen' | 'audio' | 'logs';
  webcamSnapshotUrl?: string;
  screenSnapshotUrl?: string;
  audioSnippetUrl?: string;
  reviewerNotes?: string;
  reviewerName?: string;
  auditLog: AuditEntry[];
}

export interface AnswerComparisonItem {
  questionNo: number;
  questionText: string;
  optionA: string;
  optionB: string;
  isMatch: boolean;
  isBothWrong: boolean;
  isBothCorrect: boolean;
  timeDeltaSec: number;
}

export interface SimilarityPair {
  id: string;
  examId: string;
  examTitle: string;
  studentA: { id: string; name: string; admissionNo: string; photoUrl: string; class: string };
  studentB: { id: string; name: string; admissionNo: string; photoUrl: string; class: string };
  overallSimilarityPct: number;
  wrongAnswerSimilarityPct: number;
  sameSequenceLength: number;
  submissionTimeDeltaSec: number;
  sharedIpOrDevice: boolean;
  sharedIpAddress?: string;
  riskLevel: 'high' | 'medium' | 'low';
  actionStatus: 'pending' | 'reviewed' | 'escalated' | 'dismissed';
  comparisons: AnswerComparisonItem[];
}

export interface RuleSetting {
  id: string;
  code: string;
  name: string;
  category: 'visual' | 'audio' | 'browser' | 'system' | 'ai_pattern';
  enabled: boolean;
  riskPoints: number;
  warningThreshold: number;
  highRiskThreshold: number;
  minDurationSec: number;
  confidenceThresholdPct: number;
  allowedOccurrences: number;
  autoWarning: boolean;
  autoPause: boolean;
  evidenceCapture: boolean;
  description: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ViolationType | 'System';
  message: string;
  severity: 'info' | 'warning' | 'danger';
  studentName: string;
  studentId: string;
  examTitle: string;
}

// -------------------------------------------------------------
// NEW Teacher-Side & 5-Tier Governance Portal Types
// -------------------------------------------------------------

export type ProctoringEventCode =
  | 'FACE_NOT_DETECTED'
  | 'MULTIPLE_FACE_DETECTED'
  | 'IDENTITY_MISMATCH'
  | 'FACE_POSITION_OUT_OF_BOUNDS'
  | 'LOOKING_AWAY'
  | 'LIVENESS_FAILED'
  | 'CAMERA_DISABLED'
  | 'MICROPHONE_DISABLED'
  | 'FULLSCREEN_EXIT'
  | 'TAB_SWITCH'
  | 'SUSPICIOUS_AUDIO';

export type UserRole = 'admin' | 'coordinator' | 'teacher' | 'proctor' | 'student';

export type PortalMode = 'teacher' | 'parent_student' | 'admin' | 'coordinator' | 'proctor' | 'student';

export interface StudentAccommodation {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  class: string;
  extraTimeMultiplier: number; // e.g. 1.0, 1.25, 1.5, 2.0
  relaxedProctoringSensitivity: boolean;
  allowedBreakMinutes: number;
  allowScreenReader: boolean;
  highContrastTheme: boolean;
  notes?: string;
  approvedBy: string;
  updatedAt: string;
}

export interface ExamSection {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  maxMarks: number;
  questionIds: string[];
  instructions?: string;
  isOptional?: boolean;
}

export interface SystemReadinessReport {
  cameraDetected: boolean;
  cameraPermissionGranted: boolean;
  faceDetected: boolean;
  micDetected: boolean;
  micPermissionGranted: boolean;
  audioInputActive: boolean;
  networkConnectivity: 'stable' | 'unstable' | 'offline';
  latencyMs: number;
  browserSupported: boolean;
  browserNameVersion: string;
  screenSizeValid: boolean;
  fullScreenSupported: boolean;
  idPhotoVerified: boolean;
  readinessTimestamp: string;
  isReady: boolean;
}

export type RiskScoreTier = 'normal' | 'monitor' | 'suspicious' | 'critical';

export interface DynamicRiskScoreSummary {
  score: number; // 0 to 100
  tier: RiskScoreTier;
  colorBadgeClass: string;
  label: string;
  totalViolations: number;
  lastViolationCode?: string;
  lastViolationTime?: string;
}

export function getRiskScoreSummary(score: number): DynamicRiskScoreSummary {
  if (score >= 76) {
    return {
      score,
      tier: 'critical',
      colorBadgeClass: 'bg-red-100 text-red-800 border-red-300 font-extrabold animate-pulse',
      label: 'CRITICAL (76-100)',
      totalViolations: Math.floor(score / 20),
    };
  } else if (score >= 51) {
    return {
      score,
      tier: 'suspicious',
      colorBadgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      label: 'SUSPICIOUS (51-75)',
      totalViolations: Math.floor(score / 25),
    };
  } else if (score >= 21) {
    return {
      score,
      tier: 'monitor',
      colorBadgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
      label: 'MONITOR (21-50)',
      totalViolations: Math.floor(score / 30),
    };
  }
  return {
    score,
    tier: 'normal',
    colorBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
    label: 'NORMAL (0-20)',
    totalViolations: 0,
  };
}

export interface ProctorWarningMessage {
  id: string;
  studentId: string;
  examId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  severity: 'info' | 'warning' | 'urgent';
}

export type ResultApprovalStep = 'eval_completed' | 'teacher_review' | 'coordinator_approval' | 'published';

export interface ResultApprovalState {
  examId: string;
  currentStep: ResultApprovalStep;
  teacherApprovedBy?: string;
  teacherApprovedAt?: string;
  coordinatorApprovedBy?: string;
  coordinatorApprovedAt?: string;
  publishedAt?: string;
  comments?: Array<{
    id: string;
    author: string;
    role: UserRole;
    text: string;
    timestamp: string;
  }>;
}

export type ActiveNavTab =
  | 'dashboard'
  | 'online-classes'
  | 'online-class-assessments'
  | 'create-class-assessment'
  | 'question-pool'
  | 'create-online-class'
  | 'live-classroom'
  | 'exam-scheduling'
  | 'exam-monitoring'
  | 'assessment'
  | 'publish-results'
  | 'settings'
  // Parent & Student Portal Tabs
  | 'parent-dashboard'
  | 'student-online-classes'
  | 'student-exams-list'
  | 'attend-exam'
  | 'student-results'
  // Legacy nav tabs preserved
  | 'live-exams'
  | 'proctoring-monitor'
  | 'students'
  | 'exam-sessions'
  | 'malpractice-alerts'
  | 'evidence-review'
  | 'answer-similarity'
  | 'reports'
  | 'rules-settings'
  | 'system-settings'
  | 'exam-wizard'
  | 'create-exam-basic'
  | 'create-exam-recipients'
  | 'create-exam-academic'
  | 'create-exam-question-source'
  | 'create-exam-question-pool'
  | 'create-exam-pdf-upload'
  | 'create-exam-pdf-section'
  | 'create-exam-question-bank'
  | 'create-exam-controls'
  | 'student-exam-portal'
  | 'evaluation-dashboard'
  | 'answer-evaluation'
  | 'attachment-evaluation'
  | 'result-calculation-review';

export interface ExamBasicDetailsFormData {
  examName: string;
  examCode: string;
  examType: 'spot' | 'scheduled';
  makeImmediatelyAvailable: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  instructions: string;
}

// -------------------------------------------------------------
// Prototype 03, 04, 05, 06, 07 Form Types
// -------------------------------------------------------------

export type RecipientSelectionMode = 'class_wise' | 'student_wise';

export interface RecipientStudent {
  id: string;
  name: string;
  admissionNo: string;
  academicYear: string;
  class: string;
  division: string;
  rollNo?: string;
  photoUrl?: string;
  email?: string;
}

export interface ExamRecipientsFormData {
  selectionMode: RecipientSelectionMode;
  academicYear: string;
  selectedClass: string;
  selectedDivision: string; // 'Division A', 'Division B', 'Division C', or 'all'
  selectedStudentIds: string[]; // for student-wise mode or specific selection overrides
}

export interface SubjectChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  description?: string;
  topicCount?: number;
}

export interface ExamAcademicMappingFormData {
  academicYear: string;
  selectedClass: string;
  selectedDivision: string;
  selectedSubject: string;
  selectedChapterIds: string[]; // array of chapter IDs selected (single, multiple, or all)
}

export type QuestionSourceType = 'existing_pool' | 'upload_pdf';

export interface ExamQuestionSourceFormData {
  sourceType: QuestionSourceType;
}

export type QuestionTypeCategory = 'mcq' | 'one_word' | 'short_answer' | 'long_answer' | 'essay';

export interface QuestionTypeDistributionRow {
  type: QuestionTypeCategory;
  label: string;
  questionCount: number;
  marksPerQuestion: number;
  totalMarks: number; // calculated: questionCount * marksPerQuestion
}

export interface ExamMarksDistributionFormData {
  rows: QuestionTypeDistributionRow[];
  totalQuestions: number;
  calculatedTotalMarks: number;
}

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface BankQuestionItem {
  id: string;
  subject: string;
  class: string;
  chapterId: string;
  chapterName: string;
  type: QuestionTypeCategory;
  difficulty: QuestionDifficulty;
  marks: number;
  text: string;
  options?: string[];
  correctOptionIndex?: number;
  modelAnswer?: string;
}

export type QuestionSelectionMode = 'manual' | 'random';

export interface ExamQuestionBankFormData {
  selectionMode: QuestionSelectionMode;
  selectedQuestionIds: string[];
  isLocked: boolean;
  randomSeed?: number;
}

export type PdfAnswerSubmissionType = 'omr' | 'text' | 'image_upload' | 'hybrid';

export interface ExamPdfSetupFormData {
  fileName: string | null;
  fileSize: number | null; // bytes
  pageCount: number;
  uploadDate: string | null;
  fileUrl?: string | null;
  totalMarks: number;
  questionCount: number;
  durationMinutes: number;
  submissionType: PdfAnswerSubmissionType;
  isOfficialNonEditablePaper: boolean;
}

export type AllowedAttachmentFormat = 'pdf' | 'jpg' | 'png' | 'doc';

export interface QuestionTypeSubmissionRule {
  type: QuestionTypeCategory;
  label: string;
  allowTextAnswer: boolean;
  allowAttachment: boolean;
  editorMode: 'plain' | 'rich';
  maxWordCount?: number;
}

export interface ExamAnswerSubmissionConfigFormData {
  enableTextAnswer: boolean;
  enableAttachmentAnswer: boolean;
  allowedFormats: AllowedAttachmentFormat[]; // ['pdf', 'jpg', 'png', 'doc']
  maxAttachmentSizeMb: number; // e.g. 10 MB
  maxAttachmentsPerQuestion: number; // e.g. 3
  typeRules: QuestionTypeSubmissionRule[];
}

export type ExamStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface RubricCriterion {
  id: string;
  criterion: string;
  maxScore: number;
  description?: string;
}

export interface QuestionPaperItem {
  id: string;
  sectionName: string;
  questionType: 'objective' | 'subjective';
  text: string;
  maxMarks: number;
  options?: string[];
  correctOptionIndex?: number;
  rubric?: RubricCriterion[];
  modelAnswer?: string;
}

export interface QuestionPaperSection {
  id: string;
  name: string;
  questionType: 'objective' | 'subjective';
  count: number;
  totalMarks: number;
}

export interface UploadedPaperFile {
  url: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
}

export interface StudentUploadedFile {
  id: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedAt: string;
  fileType: string;
}

export interface QuestionPaper {
  id: string;
  code: string;
  title: string;
  subject: string;
  class: string;
  totalQuestions: number;
  maxMarks: number;
  objectiveCount: number;
  subjectiveCount: number;
  paperType?: 'existing' | 'uploaded';
  uploadedFile?: UploadedPaperFile;
  sections: QuestionPaperSection[];
  questions: QuestionPaperItem[];
}

export interface ExamControlsConfig {
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  preventCopyPaste: boolean;
  fullScreenMode: boolean;
  detectTabSwitching: boolean;
  autoSubmitOnTimeEnd: boolean;
  allowResume: boolean;
  showTimer: boolean;
  allowCalculator: boolean;
  allowReviewBeforeSubmit: boolean;
}

export interface ScheduledExam {
  id: string;
  title: string;
  examType: 'Unit Test' | 'Midterm' | 'Final' | 'Quiz' | 'Term Exam';
  subject: string;
  class: string;
  section: string;
  academicYear: string;
  semester: string;
  questionPaperId: string;
  questionPaperCode: string;
  totalQuestions: number;
  maxMarks: number;
  paperType?: 'existing' | 'uploaded';
  uploadedFile?: UploadedPaperFile;
  assignmentType: 'entire_class' | 'specific_section' | 'student_group' | 'individual';
  assignedStudentIds: string[];
  studentCount: number;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timeZone: string;
  lateEntryAllowed: boolean;
  lateEntryLimitMinutes: number;
  instructions: string;
  passMarks?: number;
  controls: ExamControlsConfig;
  status: ExamStatus;
}

export type StudentExamStatus = 'active' | 'warning' | 'suspicious' | 'disconnected' | 'not_started' | 'submitted';

export interface StudentActivityTimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export interface MonitoringStudent {
  id: string;
  name: string;
  rollNo: string;
  avatar: string;
  class: string;
  section: string;
  loginTime: string;
  examStatus: StudentExamStatus;
  questionsAnswered: number;
  totalQuestions: number;
  questionsRemaining: number;
  timeRemainingMinutes: number;
  connectionStatus: ConnectionStatus;
  tabSwitchCount: number;
  warningCount: number;
  lastActivity: string;
  ipAddress: string;
  device: string;
  browser: string;
  currentQuestion: number;
  tabSwitchEvents: Array<{ timestamp: string; details: string }>;
  disconnectHistory: Array<{ timestamp: string; event: string }>;
  warningHistory: Array<{ timestamp: string; message: string; issuedBy: string }>;
  activityTimeline: StudentActivityTimelineItem[];
}

export interface LiveAlert {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  alertType: 'tab_switch' | 'disconnection' | 'reconnection' | 'multiple_login' | 'submitted' | 'time_extension' | 'warning_sent';
  severity: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  timestamp: string;
}

export interface AnswerGradeDetail {
  questionId: string;
  studentAnswerText: string;
  selectedOptionIndex?: number;
  isObjective: boolean;
  autoCalculatedScore?: number;
  awardedScore: number;
  maxMarks: number;
  teacherComment?: string;
  rubricScores?: Record<string, number>;
  markedForReview?: boolean;
  bonusMarks?: number;
  deductedMarks?: number;
  deductionReason?: string;
  overrideReason?: string;
  uploadedFiles?: StudentUploadedFile[];
  history?: Array<{
    id: string;
    timestamp: string;
    prevMarks: number;
    newMarks: number;
    reason: string;
    changedBy: string;
  }>;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  class: string;
  section: string;
  submissionTime: string;
  objectiveMarks: number;
  subjectiveMarks: number;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  evaluationStatus: 'pending' | 'in_review' | 'evaluated' | 'finalized';
  isAbsent: boolean;
  evaluator: string;
  grade: string;
  resultStatus: 'pass' | 'fail' | 'absent';
  publishStatus: 'draft' | 'ready' | 'published';
  teacherFeedback: string;
  uploadedAnswerFiles?: StudentUploadedFile[];
  answers: Record<string, AnswerGradeDetail>;
}

// -------------------------------------------------------------
// Prototype 22 Evaluation Dashboard Types (PRD Section 26)
// -------------------------------------------------------------
export type PRDEvaluationStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Published';

export interface EvaluationDashboardItem {
  id: string;
  examId: string;
  examName: string;
  examCode: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  class: string;
  division: string;
  classDivisionLabel: string;
  submissionDate: string;
  submissionIsoDate: string;
  evaluationStatus: PRDEvaluationStatus;
  obtainedMarks: number | null;
  maxMarks: number;
  passMarks?: number;
  percentage?: number;
  evaluator?: string;
  feedback?: string;
}

// -------------------------------------------------------------
// Prototype 23 Answer Evaluation Types (PRD Sections 25, 27, 28)
// -------------------------------------------------------------
export type QuestionEvaluationType = 'auto_mcq' | 'manual_text' | 'manual_essay' | 'attachment';

export interface RubricCriterionScore {
  id: string;
  criterion: string;
  maxScore: number;
  awardedScore: number;
  description?: string;
}

export interface StudentQuestionEvaluationItem {
  id: string;
  questionNumber: number;
  sectionName: string;
  evaluationType: QuestionEvaluationType;
  questionText: string;
  maxMarks: number;
  awardedMarks: number;
  teacherRemarks: string;
  isAutoEvaluated: boolean;
  autoScoredStatus?: 'correct' | 'incorrect' | 'partially_correct';
  // MCQ Specific fields
  mcqOptions?: string[];
  selectedOptionIndex?: number;
  correctOptionIndex?: number;
  // Text & Essay Specific fields
  studentTextAnswer?: string;
  wordCount?: number;
  modelAnswer?: string;
  rubrics?: RubricCriterionScore[];
  // Attachment Specific fields (PRD Sec 28)
  attachedFile?: {
    fileName: string;
    fileSize: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  };
}

export interface StudentAttemptEvaluationSession {
  submissionId: string;
  examId: string;
  examName: string;
  examCode: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  classDivisionLabel: string;
  submissionDate: string;
  maxMarks: number;
  passMarks: number;
  currentQuestionIndex: number;
  questions: StudentQuestionEvaluationItem[];
}

// -------------------------------------------------------------
// Prototype 24 Attachment Evaluation Types (PRD Section 28)
// -------------------------------------------------------------
export type AnnotationToolType = 'checkmark' | 'cross' | 'highlight' | 'comment';

export interface VisualAnnotationMark {
  id: string;
  type: AnnotationToolType;
  xPct: number;
  yPct: number;
  pageNumber: number;
  commentText?: string;
  createdAt: string;
}

export interface AttachmentEvaluationRecord {
  id: string;
  submissionId: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  sectionName: string;
  examId: string;
  examName: string;
  examCode: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  classDivisionLabel: string;
  submissionDate: string;
  fileInfo: {
    fileName: string;
    fileSize: string;
    fileUrl: string;
    fileType: string;
    pageCount: number;
    uploadedAt: string;
  };
  downloadPermitted: boolean;
  downloadRestrictionReason?: string;
  maxMarks: number;
  awardedMarks: number;
  teacherRemarks: string;
  rubrics?: RubricCriterionScore[];
  annotations: VisualAnnotationMark[];
}

// -------------------------------------------------------------
// Prototype 25 Result Calculation & Review Types (PRD Sections 29, 30)
// -------------------------------------------------------------
export interface CandidateResultCalculationSummary {
  submissionId: string;
  examId: string;
  examName: string;
  examCode: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  classDivisionLabel: string;
  submissionDate: string;
  totalMaxMarks: number;
  obtainedObjectiveMarks: number;
  obtainedSubjectiveMarks: number;
  obtainedAttachmentMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  passMarkPercentage: number;
  isPassed: boolean;
  grade: string;
  gradeLabel: string;
  evaluatedQuestions: StudentQuestionEvaluationItem[];
}

export interface GradeRule {
  grade: string;
  minPct: number;
  maxPct: number;
  label: string;
}

export interface ResultSettings {
  passingPercentage: number;
  gradeRules: GradeRule[];
  showMarksToStudents: boolean;
  showPercentage: boolean;
  showGrade: boolean;
  showAnswerSheet: boolean;
  showCorrectAnswers: boolean;
  showTeacherFeedback: boolean;
  showRank: boolean;
  publishScheduledDate: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  timestamp: string;
  category: 'exam' | 'assessment' | 'result' | 'system';
  badgeType: 'info' | 'success' | 'warning';
}

// -------------------------------------------------------------
// Parent & Multi-Student Portal Types
// -------------------------------------------------------------

export interface ChildStudent {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  admissionNo: string;
  avatar: string;
  attendancePct: number;
  overallGrade: string;
  rankInClass: number;
  totalExamsAttended: number;
  upcomingExamsCount: number;
}

export interface ParentAccount {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  children: ChildStudent[];
}

// -------------------------------------------------------------
// Online Class & Virtual Lecture Types
// -------------------------------------------------------------

export type OnlineClassPlatform = 'in_app' | 'google_meet' | 'zoom' | 'ms_teams';
export type OnlineClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type OnlineClassRecurrence = 'none' | 'daily' | 'weekly' | 'mwf' | 'tts' | 'custom';

export interface OnlineClassMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'slide' | 'doc' | 'video' | 'link';
  fileSize?: string;
  url: string;
  uploadedAt: string;
}

export interface ClassroomPermissions {
  allowStudentMic: boolean;
  allowStudentCamera: boolean;
  allowChat: boolean;
  allowScreenShare: boolean;
  enableWhiteboard: boolean;
  recordSession: boolean;
  requireWaitingRoom: boolean;
  autoAttendance: boolean;
  enableQnA: boolean;
  enableBreakoutRooms: boolean;
}

export interface OnlineClass {
  id: string;
  title: string;
  subject: string;
  class: string;
  section: string;
  academicYear: string;
  instructorName: string;
  instructorAvatar?: string;
  instructorTitle?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timeZone: string;
  status: OnlineClassStatus;
  platform: OnlineClassPlatform;
  meetingLink: string;
  meetingId?: string;
  passcode?: string;
  enrolledStudentsCount: number;
  liveAttendanceCount: number;
  maxCapacity: number;
  description: string;
  topics: string[];
  materials: OnlineClassMaterial[];
  permissions: ClassroomPermissions;
  recurrence: OnlineClassRecurrence;
  recurrenceDays?: string[];
  recordingUrl?: string;
  associatedExamId?: string;
  associatedExamTitle?: string;
  createdAt: string;
}

export interface CreateOnlineClassFormData {
  title: string;
  subject: string;
  class: string;
  section: string;
  academicYear: string;
  instructorName: string;
  instructorTitle: string;
  description: string;
  topics: string[];
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timeZone: string;
  recurrence: OnlineClassRecurrence;
  recurrenceDays: string[];
  platform: OnlineClassPlatform;
  autoGenerateLink: boolean;
  customMeetingLink: string;
  meetingId: string;
  passcode: string;
  maxCapacity: number;
  permissions: ClassroomPermissions;
  materials: OnlineClassMaterial[];
  notifyStudents: boolean;
  notifyParents: boolean;
  sendCalendarInvite: boolean;
  reminderMinutes: number;
  associatedExamId?: string;
}

// -------------------------------------------------------------
// Live In-Class Assessment & Real-time Quiz Types
// -------------------------------------------------------------

export type BloomsTaxonomyLevel =
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Analyze'
  | 'Evaluate'
  | 'Create';

export type LiveAssessmentQuestionType =
  | 'mcq'
  | 'mmcq'
  | 'fill_in_blanks'
  | 'match_following'
  | 'step_ordering'
  | 'short_answer';

export interface MatchingPairItem {
  id: string;
  leftText: string;
  rightText: string;
}

export interface BlankSlotItem {
  id: string;
  label: string;
  sentencePrefix: string;
  sentenceSuffix?: string;
  correctAnswer: string;
}

export interface LiveAssessmentSection {
  id: string;
  title?: string;
  description?: string;
}

export interface LiveAssessmentQuestion {
  id: string;
  sectionId?: string;
  poolQuestionId?: string;
  type: LiveAssessmentQuestionType;
  prompt: string;
  marks: number;
  explanation?: string;
  bloomsTaxonomy?: BloomsTaxonomyLevel;
  // MCQ fields (Single Choice)
  options?: string[];
  correctOptionIndex?: number;
  // MMCQ fields (Multiple Choice - Multiple Correct)
  correctOptionIndices?: number[];
  minSelections?: number;
  // Match the Following fields
  matchingPairs?: MatchingPairItem[];
  // Fill in the Blanks (Drag to Blank) fields
  blankSlots?: BlankSlotItem[];
  blankOptions?: string[];
  // Step Ordering / Sequence Proof fields (e.g. Maths problem solving steps with distractors)
  orderedSteps?: string[];
  distractorSteps?: string[];
  // Short Answer fields
  sampleAnswer?: string;
  keywords?: string[];
}

export interface LiveStudentAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  selectedOptionIndices?: number[]; // For MMCQ
  matchedPairs?: Record<string, string>; // leftText/id -> rightText/id
  blankAnswers?: Record<string, string>; // slotId -> droppedOption
  placedSteps?: string[]; // For Step Ordering
  textAnswer?: string;
  isAutoCorrect?: boolean;
  scoreAwarded?: number;
}

export interface LiveAssessmentSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  avatar: string;
  submittedAt: string;
  answers: Record<string, LiveStudentAnswer>;
  totalScore: number;
  maxMarks: number;
  percentage: number;
  status: 'submitted' | 'reviewed';
  teacherFeedback?: string;
}

export interface LiveInClassAssessment {
  id: string;
  classId?: string;
  title: string;
  subject: string;
  topic: string;
  targetClass?: string;
  durationSeconds: number; // e.g. 180 (3 minutes), 0 for untimed
  totalMarks: number;
  passMarks?: number;
  status: 'active' | 'closed' | 'published' | 'draft';
  isDraft?: boolean;
  launchedAt?: string;
  createdAt?: string;
  instructions?: string;
  sections?: LiveAssessmentSection[];
  questions: LiveAssessmentQuestion[];
  submissions: LiveAssessmentSubmission[];
}



export interface PoolQuestion extends LiveAssessmentQuestion {
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  bloomsTaxonomy?: BloomsTaxonomyLevel;
}
