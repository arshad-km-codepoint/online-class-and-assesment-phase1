export interface PlatformSystemConfig {
  platformName: string;
  systemVersion: string;
  defaultLanguage: string;
  masterTimezone: string;
  platformSupportEmail: string;
  maintenanceMode: boolean;
}

export interface TenantOrganizationProfile {
  campusName: string;
  campusCode: string;
  affiliationBoard: string;
  administratorEmail: string;
  campusTimezone: string;
  academicYear: string;
  campusAddress: string;
  institutionLogoUrl: string;
}

export interface ClassroomConfig {
  defaultPlatform: 'in_app' | 'google_meet' | 'zoom' | 'ms_teams';
  streamQuality: 'auto' | '720p' | '1080p';
  recordingStorageProvider: 'aws_s3' | 'google_cloud' | 'azure_blob' | 'local_encrypted';
  autoAttendanceThresholdPct: number;
  defaultStudentMic: boolean;
  defaultStudentCamera: boolean;
  defaultChatEnabled: boolean;
  requireWaitingRoom: boolean;
  autoRecordSession: boolean;
  maxCapacity: number;
}

export interface AssessmentProctoringConfig {
  defaultAssessmentMode: 'spot_quiz' | 'scheduled_exam' | 'hybrid';
  proctoringSensitivity: 'strict' | 'standard' | 'lenient';
  maxTabSwitchesAllowed: number;
  fullScreenEnforcement: 'strict' | 'warning_only' | 'disabled';
  faceCheckIntervalSec: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  preventCopyPaste: boolean;
  lateSubmissionGraceMinutes: number;
  passingPercentage: number;
  allowCalculator: boolean;
}

export interface SmartCardVerificationConfig {
  verificationMode: 'nfc_and_face' | 'nfc_only' | 'face_only' | 'roll_manual';
  faceConfidenceThresholdPct: number;
  smartCardReaderEndpoint: string;
  readerBaudRate: string;
  allowTeacherManualBypass: boolean;
  requireLivenessCheck: boolean;
}

export interface NotificationConfig {
  googleServiceAccountJson: string;
  defaultSmsProvider: 'Twilio' | 'AWS SNS' | 'Gupshup' | 'MessageBird';
  defaultWhatsappProvider: 'Twilio WhatsApp' | 'Gupshup WhatsApp' | 'Meta Cloud API' | 'Infobip';
  defaultEmailProvider: 'Amazon SES' | 'SendGrid' | 'Mailgun' | 'Custom SMTP';
  notifyOnAssessmentLaunch: boolean;
  notifyOnAbsence: boolean;
  notifyOnMalpracticeAlert: boolean;
  notifyOnResultPublished: boolean;
  smsSenderId: string;
}

export interface IntegrationsConfig {
  coreSystemJwtKey: string;
  aiEvaluationApiKey: string;
  zoomApiKey: string;
  zoomApiSecret: string;
  googleWorkspaceDomainKey: string;
  sisWebhookUrl: string;
  webhookSecretKey: string;
}

export interface DynamicParameter {
  id: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

export interface GlobalAppConfig {
  platform: PlatformSystemConfig;
  classroom: ClassroomConfig;
  assessment: AssessmentProctoringConfig;
  smartCard: SmartCardVerificationConfig;
  notifications: NotificationConfig;
  integrations: IntegrationsConfig;
  dynamicParameters: DynamicParameter[];
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  region: string;
  studentCount: number;
  status: 'active' | 'suspended';
}

export interface TenantConfigRecord {
  tenantId: string;
  organization: TenantOrganizationProfile;
  overriddenSections: {
    classroom?: boolean;
    assessment?: boolean;
    smartCard?: boolean;
    notifications?: boolean;
    dynamicParameters?: boolean;
  };
  classroom: ClassroomConfig;
  assessment: AssessmentProctoringConfig;
  smartCard: SmartCardVerificationConfig;
  notifications: NotificationConfig;
  dynamicParameters: DynamicParameter[];
}

export const INITIAL_GLOBAL_CONFIG: GlobalAppConfig = {
  platform: {
    platformName: 'CampusEnlight Multi-Tenant Education Suite',
    systemVersion: 'v4.8.0-LTS',
    defaultLanguage: 'English (US)',
    masterTimezone: 'Asia/Kolkata (IST)',
    platformSupportEmail: 'cloud-support@campusenlight.edu',
    maintenanceMode: false,
  },
  classroom: {
    defaultPlatform: 'in_app',
    streamQuality: 'auto',
    recordingStorageProvider: 'aws_s3',
    autoAttendanceThresholdPct: 75,
    defaultStudentMic: false,
    defaultStudentCamera: true,
    defaultChatEnabled: true,
    requireWaitingRoom: true,
    autoRecordSession: true,
    maxCapacity: 120,
  },
  assessment: {
    defaultAssessmentMode: 'spot_quiz',
    proctoringSensitivity: 'standard',
    maxTabSwitchesAllowed: 3,
    fullScreenEnforcement: 'strict',
    faceCheckIntervalSec: 5,
    randomizeQuestions: true,
    randomizeOptions: true,
    preventCopyPaste: true,
    lateSubmissionGraceMinutes: 5,
    passingPercentage: 40,
    allowCalculator: false,
  },
  smartCard: {
    verificationMode: 'nfc_and_face',
    faceConfidenceThresholdPct: 85,
    smartCardReaderEndpoint: 'ws://192.168.1.105:9080/nfc-reader/stream',
    readerBaudRate: '115200 bps (ISO 14443 Type A/Mifare)',
    allowTeacherManualBypass: true,
    requireLivenessCheck: true,
  },
  notifications: {
    googleServiceAccountJson: `{\n  "type": "service_account",\n  "project_id": "campusenlight-live-fcm",\n  "private_key_id": "8f43a9b1c0e278d94e32a67bc4123f0981",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7vZ42...\\n-----END PRIVATE KEY-----",\n  "client_email": "firebase-adminsdk-live@campusenlight-live-fcm.iam.gserviceaccount.com"\n}`,
    defaultSmsProvider: 'Twilio',
    defaultWhatsappProvider: 'Twilio WhatsApp',
    defaultEmailProvider: 'Amazon SES',
    notifyOnAssessmentLaunch: true,
    notifyOnAbsence: true,
    notifyOnMalpracticeAlert: true,
    notifyOnResultPublished: true,
    smsSenderId: 'CAMPUS',
  },
  integrations: {
    coreSystemJwtKey: 'Xvfrdndpvf-Xoq7i97e434pMQJB1yTGODeeEHjex2F4OuXYNcWVVQvMycyE92_ENLIGHT_PROD_KEY',
    aiEvaluationApiKey: 'AIzaSyAcGGDIInRYyP0xSXveMnbHWnf2n-h0V18_GEMINI_ONLINE_EVAL',
    zoomApiKey: 'ZM_SDK_CLIENT_ID_987346129841',
    zoomApiSecret: 'zm_sec_live_d87f61209bca34812398401948ba',
    googleWorkspaceDomainKey: 'admin-oauth-campusenlight.apps.googleusercontent.com',
    sisWebhookUrl: 'https://api.campusenlight.edu/v1/webhooks/lms-sync',
    webhookSecretKey: 'whsec_9831a2984fbe4312a09cb231f4e1293',
  },
  dynamicParameters: [
    {
      id: 'dp-1',
      key: 'enable_interactive_whiteboard',
      value: 'true',
      description: 'Permits teachers and invited students to draw on the collaborative canvas.',
      enabled: true,
    },
    {
      id: 'dp-2',
      key: 'max_live_streams_concurrency',
      value: '50',
      description: 'Maximum parallel WebRTC stream sessions per node cluster.',
      enabled: true,
    },
    {
      id: 'dp-3',
      key: 'offline_sync_buffer_mb',
      value: '256',
      description: 'Client IndexedDB buffer size for offline answer synchronization.',
      enabled: true,
    },
    {
      id: 'dp-4',
      key: 'allow_student_recording_download',
      value: 'false',
      description: 'Restricts video lecture recordings to in-portal streaming only.',
      enabled: true,
    },
  ],
};

export const MOCK_TENANTS: TenantInfo[] = [
  {
    id: 'TENANT-001',
    name: 'Springfield International Academy - Main Campus',
    code: 'SIA-MAIN',
    region: 'North District',
    studentCount: 1420,
    status: 'active',
  },
  {
    id: 'TENANT-002',
    name: 'Oakridge Global High School - North Campus',
    code: 'OGHS-NORTH',
    region: 'Metropolitan Zone',
    studentCount: 980,
    status: 'active',
  },
  {
    id: 'TENANT-003',
    name: "St. Xavier's Model Senior School",
    code: 'SXMS-CENTRAL',
    region: 'West District',
    studentCount: 2150,
    status: 'active',
  },
  {
    id: 'TENANT-004',
    name: 'Horizon STEM College & Prep',
    code: 'HSCP-TECH',
    region: 'Innovation Valley',
    studentCount: 650,
    status: 'active',
  },
];

export const INITIAL_TENANT_CONFIGS: Record<string, TenantConfigRecord> = {
  'TENANT-001': {
    tenantId: 'TENANT-001',
    organization: {
      campusName: 'Springfield International Academy - Main Campus',
      campusCode: 'SIA-MAIN-001',
      affiliationBoard: 'CBSE (Central Board of Secondary Education)',
      administratorEmail: 'principal@sia-springfield.edu',
      campusTimezone: 'Asia/Kolkata (IST)',
      academicYear: '2025 - 2026',
      campusAddress: '14/B Education Enclave, North City District',
      institutionLogoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&auto=format&fit=crop&q=80',
    },
    overriddenSections: {
      classroom: true,
      assessment: false,
      smartCard: false,
      notifications: true,
      dynamicParameters: true,
    },
    classroom: {
      ...INITIAL_GLOBAL_CONFIG.classroom,
      defaultPlatform: 'google_meet',
      maxCapacity: 150,
    },
    assessment: {
      ...INITIAL_GLOBAL_CONFIG.assessment,
    },
    smartCard: {
      ...INITIAL_GLOBAL_CONFIG.smartCard,
    },
    notifications: {
      ...INITIAL_GLOBAL_CONFIG.notifications,
      smsSenderId: 'SIAEDU',
    },
    dynamicParameters: [
      ...INITIAL_GLOBAL_CONFIG.dynamicParameters,
      {
        id: 'dp-sia-1',
        key: 'sia_parent_app_direct_link',
        value: 'https://parent.sia-springfield.edu/portal',
        description: 'Direct portal link pushed to student identity cards.',
        enabled: true,
      },
    ],
  },
  'TENANT-002': {
    tenantId: 'TENANT-002',
    organization: {
      campusName: 'Oakridge Global High School - North Campus',
      campusCode: 'OGHS-NORTH-002',
      affiliationBoard: 'Cambridge Assessment International Education (IGCSE)',
      administratorEmail: 'dean.academics@oakridgeglobal.org',
      campusTimezone: 'Asia/Kolkata (IST)',
      academicYear: '2025 - 2026',
      campusAddress: 'Plot 88, Sector 8, Metropolitan Zone',
      institutionLogoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=128&auto=format&fit=crop&q=80',
    },
    overriddenSections: {
      classroom: true,
      assessment: true,
      smartCard: false,
      notifications: false,
      dynamicParameters: false,
    },
    classroom: {
      ...INITIAL_GLOBAL_CONFIG.classroom,
      defaultPlatform: 'zoom',
    },
    assessment: {
      ...INITIAL_GLOBAL_CONFIG.assessment,
      proctoringSensitivity: 'strict',
      maxTabSwitchesAllowed: 1,
    },
    smartCard: {
      ...INITIAL_GLOBAL_CONFIG.smartCard,
    },
    notifications: {
      ...INITIAL_GLOBAL_CONFIG.notifications,
    },
    dynamicParameters: [
      ...INITIAL_GLOBAL_CONFIG.dynamicParameters,
    ],
  },
  'TENANT-003': {
    tenantId: 'TENANT-003',
    organization: {
      campusName: "St. Xavier's Model Senior School",
      campusCode: 'SXMS-CENTRAL-003',
      affiliationBoard: 'ICSE (Indian Certificate of Secondary Education)',
      administratorEmail: 'contact@stxaviers-model.edu',
      campusTimezone: 'Asia/Kolkata (IST)',
      academicYear: '2025 - 2026',
      campusAddress: 'St. Xavier Heritage Road, West District',
      institutionLogoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=128&auto=format&fit=crop&q=80',
    },
    overriddenSections: {
      classroom: false,
      assessment: false,
      smartCard: true,
      notifications: false,
      dynamicParameters: false,
    },
    classroom: {
      ...INITIAL_GLOBAL_CONFIG.classroom,
    },
    assessment: {
      ...INITIAL_GLOBAL_CONFIG.assessment,
    },
    smartCard: {
      ...INITIAL_GLOBAL_CONFIG.smartCard,
      verificationMode: 'nfc_only',
      smartCardReaderEndpoint: 'ws://10.0.4.52:9080/nfc-reader/stream',
    },
    notifications: {
      ...INITIAL_GLOBAL_CONFIG.notifications,
    },
    dynamicParameters: [
      ...INITIAL_GLOBAL_CONFIG.dynamicParameters,
    ],
  },
  'TENANT-004': {
    tenantId: 'TENANT-004',
    organization: {
      campusName: 'Horizon STEM College & Prep',
      campusCode: 'HSCP-TECH-004',
      affiliationBoard: 'IB Diploma Programme (International Baccalaureate)',
      administratorEmail: 'admin@horizonstem.edu',
      campusTimezone: 'Asia/Kolkata (IST)',
      academicYear: '2025 - 2026',
      campusAddress: 'Cyber City Tech Boulevard, Innovation Valley',
      institutionLogoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&auto=format&fit=crop&q=80',
    },
    overriddenSections: {
      classroom: false,
      assessment: true,
      smartCard: false,
      notifications: false,
      dynamicParameters: false,
    },
    classroom: {
      ...INITIAL_GLOBAL_CONFIG.classroom,
    },
    assessment: {
      ...INITIAL_GLOBAL_CONFIG.assessment,
      allowCalculator: true,
    },
    smartCard: {
      ...INITIAL_GLOBAL_CONFIG.smartCard,
    },
    notifications: {
      ...INITIAL_GLOBAL_CONFIG.notifications,
    },
    dynamicParameters: [
      ...INITIAL_GLOBAL_CONFIG.dynamicParameters,
    ],
  },
};
