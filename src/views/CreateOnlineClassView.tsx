import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import {
  Video,
  Calendar,
  Clock,
  BookOpen,
  Users,
  Shield,
  FileText,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Link as LinkIcon,
  Mic,
  Camera,
  MessageSquare,
  Share2,
  Sparkles,
  Radio,
  Tv,
  Globe,
  Bell,
  Lock,
  Eye,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  OnlineClassPlatform,
  OnlineClassRecurrence,
  ClassroomPermissions,
  OnlineClassMaterial,
  CreateOnlineClassFormData,
} from '../types';

export const CreateOnlineClassView: React.FC = () => {
  const { setActiveTab, addOnlineClass, addToast } = useExam();

  // Wizard Tab Navigation
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<CreateOnlineClassFormData>({
    title: '',
    subject: 'Mathematics',
    class: 'Class 10',
    section: 'Sec A',
    academicYear: '2026-2027',
    instructorName: 'Prof. Sarah Jenkins',
    instructorTitle: 'Senior Math & Physics Faculty',
    description: '',
    topics: ['Differential Calculus', 'Real-world Kinematic Models'],
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:15 AM',
    durationMinutes: 75,
    timeZone: 'IST (UTC+05:30)',
    recurrence: 'none',
    recurrenceDays: ['Mon', 'Wed', 'Fri'],
    platform: 'in_app',
    autoGenerateLink: true,
    customMeetingLink: '',
    meetingId: '892-410-7712',
    passcode: 'EDU' + Math.floor(1000 + Math.random() * 9000),
    maxCapacity: 60,
    permissions: {
      allowStudentMic: true,
      allowStudentCamera: true,
      allowChat: true,
      allowScreenShare: false,
      enableWhiteboard: true,
      recordSession: true,
      requireWaitingRoom: true,
      autoAttendance: true,
      enableQnA: true,
      enableBreakoutRooms: true,
    },
    materials: [
      {
        id: 'mat-init-1',
        title: 'Lecture Overview & Problem Set.pdf',
        type: 'pdf',
        fileSize: '2.4 MB',
        url: '#',
        uploadedAt: 'Today',
      },
    ],
    notifyStudents: true,
    notifyParents: true,
    sendCalendarInvite: true,
    reminderMinutes: 15,
  });

  const [newTopicInput, setNewTopicInput] = useState('');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'pdf' | 'slide' | 'doc' | 'video' | 'link'>('pdf');

  // Subjects & Classes options
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'Computer Science', 'History'];
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const sections = ['Sec A', 'Sec B', 'Sec C', 'All Sections (Merged)'];
  const platforms: { id: OnlineClassPlatform; name: string; desc: string; badge: string; iconBg: string }[] = [
    {
      id: 'in_app',
      name: 'EduStream HD (Recommended)',
      desc: 'Built-in interactive classroom with live proctoring, whiteboard & auto-attendance',
      badge: 'Zero Setup • Native HD',
      iconBg: 'bg-[#f39223]',
    },
    {
      id: 'google_meet',
      name: 'Google Meet',
      desc: 'Connect automatically via Google Workspace with auto-generated Meet link',
      badge: 'Google Workspace',
      iconBg: 'bg-emerald-600',
    },
    {
      id: 'zoom',
      name: 'Zoom Cloud Meetings',
      desc: 'Enterprise Zoom integration with breakout rooms and cloud recordings',
      badge: 'Zoom Pro',
      iconBg: 'bg-sky-600',
    },
    {
      id: 'ms_teams',
      name: 'Microsoft Teams',
      desc: 'Seamless integration with Microsoft 365 School tenant & channels',
      badge: 'Office 365',
      iconBg: 'bg-indigo-600',
    },
  ];

  const steps = [
    { number: 1, title: 'Class Details & Curriculum', desc: 'Subject, grade, instructor & topics' },
    { number: 2, title: 'Schedule & Recurrence', desc: 'Date, timing, duration & timetable' },
    { number: 3, title: 'Platform & Video Room', desc: 'EduStream HD, Meet, Zoom or Teams' },
    { number: 4, title: 'Classroom Controls & Security', desc: 'Permissions, whiteboard & recording' },
    { number: 5, title: 'Class Materials', desc: 'Pre-reads, slides & reminders' },
  ];

  // Helper functions
  const addTopic = () => {
    if (newTopicInput.trim() && !formData.topics.includes(newTopicInput.trim())) {
      setFormData((prev) => ({ ...prev, topics: [...prev.topics, newTopicInput.trim()] }));
      setNewTopicInput('');
    }
  };

  const removeTopic = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const addMaterial = () => {
    if (newMaterialTitle.trim()) {
      const newMat: OnlineClassMaterial = {
        id: 'mat-' + Date.now(),
        title: newMaterialTitle.trim(),
        type: newMaterialType,
        fileSize: (Math.random() * 4 + 1).toFixed(1) + ' MB',
        url: '#',
        uploadedAt: 'Today',
      };
      setFormData((prev) => ({ ...prev, materials: [...prev.materials, newMat] }));
      setNewMaterialTitle('');
    }
  };

  const removeMaterial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const handleCreateClass = (launchNow: boolean = false) => {
    if (!formData.title.trim()) {
      addToast('Class Title Required', 'Please enter a title for the online class.', 'warning');
      setActiveStep(1);
      return;
    }

    const meetingLink =
      formData.platform === 'in_app'
        ? `https://eduexam.pro/live/cls-${Date.now().toString(36)}`
        : formData.autoGenerateLink
        ? `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
        : formData.customMeetingLink || 'https://eduexam.pro/live/session';

    addOnlineClass({
      title: formData.title,
      subject: formData.subject,
      class: formData.class,
      section: formData.section,
      academicYear: formData.academicYear,
      instructorName: formData.instructorName,
      instructorTitle: formData.instructorTitle,
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      durationMinutes: formData.durationMinutes,
      timeZone: formData.timeZone,
      status: launchNow ? 'live' : 'scheduled',
      platform: formData.platform,
      meetingLink,
      meetingId: formData.meetingId,
      passcode: formData.passcode,
      enrolledStudentsCount: 42,
      liveAttendanceCount: launchNow ? 1 : 0,
      maxCapacity: formData.maxCapacity,
      description: formData.description || `Live online session on ${formData.title} for ${formData.class} ${formData.section}.`,
      topics: formData.topics.length > 0 ? formData.topics : ['Key concepts', 'Classroom discussion'],
      materials: formData.materials,
      permissions: formData.permissions,
      recurrence: formData.recurrence,
      recurrenceDays: formData.recurrenceDays,
    });

    if (launchNow) {
      setActiveTab('live-classroom');
    } else {
      setActiveTab('online-classes');
    }
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => setActiveTab('online-classes')}
        className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 transition cursor-pointer flex items-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        Cancel
      </button>
      <button
        type="button"
        onClick={() => handleCreateClass(false)}
        className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
        Schedule Class
      </button>
      <button
        type="button"
        onClick={() => handleCreateClass(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm cursor-pointer"
      >
        <Play className="w-4 h-4" />
        Start Instantly
      </button>
    </>
  );

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
        { label: 'Online Classes', onClick: () => setActiveTab('online-classes') },
        { label: 'New Class Creation Studio', active: true },
      ]}
      title="Create & Schedule Online Class"
      subtitle="Set up virtual classrooms with integrated WebRTC / Meet / Zoom streaming, live attendance, and materials"
      onBack={() => setActiveTab('online-classes')}
      actions={headerActions}
    >
      <div className="space-y-6 w-full">
        {/* Step Progress Stepper Bar */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {steps.map((step) => {
              const isCurrent = activeStep === step.number;
              const isDone = activeStep > step.number;
              return (
                <button
                  type="button"
                  key={step.number}
                  onClick={() => setActiveStep(step.number)}
                  className={`text-left p-3 rounded-xl border transition-all relative cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--primary-light)]/40 border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-xs'
                      : isDone
                      ? 'bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--primary-light)]/20'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)]/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-color)]'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.number}
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                      Step {step.number}
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold leading-tight truncate ${
                      isCurrent ? 'text-[var(--primary-hover)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{step.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

      {/* Main Grid: Form Steps + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Step Contents */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Class Details & Curriculum */}
          {activeStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-[#f39223]" />
                    Step 1: Basic Class Information & Academic Mapping
                  </div>
                  <span className="text-[11px] font-semibold text-[#c26d15] bg-[#fff4e6] px-2.5 py-0.5 rounded-full border border-[#fcd8b3]">
                    Curriculum Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Specify class title, target academic grade, subject, division, and syllabus topics.
                </p>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Class Title / Topic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Advanced Calculus: Limits, Derivatives & Real-world Optimization"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Subject, Class, Section Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    >
                      {subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Target Grade / Class
                    </label>
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    >
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Section / Division
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    >
                      {sections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Instructor & Academic Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Lead Instructor / Teacher
                    </label>
                    <input
                      type="text"
                      value={formData.instructorName}
                      onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Instructor Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.instructorTitle}
                      onChange={(e) => setFormData({ ...formData, instructorTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Class Description & Learning Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what students will learn, prerequisites, and required study material..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                  />
                </div>

                {/* Key Topic Badges / Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Topics & Sub-topics Covered
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={newTopicInput}
                      onChange={(e) => setNewTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTopic();
                        }
                      }}
                      placeholder="Add subtopic (e.g. Chain Rule, L'Hôpital's Rule) & press Enter"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTopic}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Topic
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {formData.topics.map((top, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#fff4e6] text-[#c26d15] border border-[#fcd8b3] text-xs font-semibold"
                      >
                        <span>{top}</span>
                        <button
                          type="button"
                          onClick={() => removeTopic(idx)}
                          className="text-[#f39223] hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Schedule, Timing & Recurrence */}
          {activeStep === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-[#f39223]" />
                    Step 2: Date, Timing & Timetable Recurrence
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Smart Conflict Check
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure session date, duration, start/end timestamps, and automated weekly schedules.
                </p>
              </div>

              <div className="space-y-4">
                {/* Date & Time Zone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Session Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Time Zone
                    </label>
                    <select
                      value={formData.timeZone}
                      onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    >
                      <option value="IST (UTC+05:30)">IST (UTC+05:30) - India Standard Time</option>
                      <option value="UTC (UTC+00:00)">UTC (UTC+00:00) - Universal Time</option>
                      <option value="EST (UTC-05:00)">EST (UTC-05:00) - Eastern Time</option>
                      <option value="PST (UTC-08:00)">PST (UTC-08:00) - Pacific Time</option>
                      <option value="GST (UTC+04:00)">GST (UTC+04:00) - Gulf Standard Time</option>
                    </select>
                  </div>
                </div>

                {/* Start Time, End Time & Duration Preset */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="e.g. 10:00 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="e.g. 11:15 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Duration Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Quick Duration Presets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[30, 45, 60, 75, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormData({ ...formData, durationMinutes: mins })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          formData.durationMinutes === mins
                            ? 'bg-[#f39223] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recurrence Settings */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Recurrence & Timetable Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'One-Time Only', sub: 'Single lecture' },
                        { id: 'daily', label: 'Daily', sub: 'Mon to Fri' },
                        { id: 'mwf', label: 'Mon / Wed / Fri', sub: '3 days/week' },
                        { id: 'tts', label: 'Tue / Thu / Sat', sub: '3 days/week' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, recurrence: item.id as OnlineClassRecurrence })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.recurrence === item.id
                              ? 'bg-[#fff4e6] border-[#f39223] ring-1 ring-[#fcd8b3] text-[#c26d15] font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Platform & Video Room */}
          {activeStep === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Tv className="w-4 h-4 text-[#f39223]" />
                    Step 3: Streaming Platform & Video Room Setup
                  </div>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    High Bitrate WebRTC
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Choose between built-in browser-based classroom streaming or external enterprise providers.
                </p>
              </div>

              <div className="space-y-4">
                {/* Platform Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {platforms.map((plat) => {
                    const isSelected = formData.platform === plat.id;
                    return (
                      <div
                        key={plat.id}
                        onClick={() => setFormData({ ...formData, platform: plat.id })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#fff4e6] border-[#f39223] ring-2 ring-[#f39223]/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg ${plat.iconBg} text-white flex items-center justify-center shadow-xs`}
                            >
                              <Video className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{plat.name}</h4>
                              <span className="text-[10px] font-semibold text-[#f39223]">
                                {plat.badge}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#f39223] bg-[#f39223] text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{plat.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Meeting Credentials */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#f39223]" />
                      Session Access Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          passcode: 'EDU' + Math.floor(1000 + Math.random() * 9000),
                        })
                      }
                      className="text-[11px] font-semibold text-[#f39223] hover:underline"
                    >
                      Regenerate Passcode
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Secure Meeting ID
                      </label>
                      <input
                        type="text"
                        value={formData.meetingId}
                        onChange={(e) => setFormData({ ...formData, meetingId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Student Passcode / PIN
                      </label>
                      <input
                        type="text"
                        value={formData.passcode}
                        onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">Max Room Capacity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) =>
                          setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 60 })
                        }
                        className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-center"
                      />
                      <span className="text-xs text-slate-500">Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Classroom Controls & Security */}
          {activeStep === 4 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Shield className="w-4 h-4 text-[#f39223]" />
                    Step 4: Interactive Controls, Governance & Permissions
                  </div>
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Proctoring & Moderation
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce strict student camera/mic policies, waiting room, auto-recording, and attendance logging.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'requireWaitingRoom',
                    title: 'Require Waiting Room / Host Approval',
                    desc: 'Students wait in lobby until teacher admits them individually or in batch',
                    icon: <Lock className="w-4 h-4 text-amber-600" />,
                  },
                  {
                    key: 'autoAttendance',
                    title: 'Automated Real-Time Attendance Capture',
                    desc: 'Log exact join/exit timestamps and generate student engagement metrics',
                    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                  },
                  {
                    key: 'recordSession',
                    title: 'Automatic Cloud Session Recording',
                    desc: 'Record video stream & audio to cloud for parent/student revision portal',
                    icon: <Radio className="w-4 h-4 text-red-600" />,
                  },
                  {
                    key: 'enableWhiteboard',
                    title: 'Interactive Multi-User Whiteboard',
                    desc: 'Allow collaborative drawing, math equations & stylus annotation',
                    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
                  },
                  {
                    key: 'allowStudentMic',
                    title: 'Allow Student Microphone Access',
                    desc: 'Students can unmute themselves during Q&A and class discussions',
                    icon: <Mic className="w-4 h-4 text-teal-600" />,
                  },
                  {
                    key: 'allowStudentCamera',
                    title: 'Allow Student HD Webcams',
                    desc: 'Enable student video grid for visual proctoring and classroom interaction',
                    icon: <Camera className="w-4 h-4 text-indigo-600" />,
                  },
                  {
                    key: 'allowChat',
                    title: 'In-Class Public & Private Chat',
                    desc: 'Enable real-time message board with teacher profanity filtering',
                    icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
                  },
                  {
                    key: 'allowScreenShare',
                    title: 'Allow Student Screen Sharing',
                    desc: 'Allow assigned students to present their project screens upon request',
                    icon: <Share2 className="w-4 h-4 text-slate-600" />,
                  },
                ].map((item) => {
                  const isChecked = (formData.permissions as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [item.key]: !isChecked,
                          },
                        })
                      }
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#fff4e6]/50 border-[#fcd8b3]'
                          : 'bg-slate-50/50 border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>
                      </div>

                      <div
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                          isChecked ? 'bg-[#f39223]' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            isChecked ? 'translate-x-5 shadow-xs' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Materials & Assessment Link */}
          {activeStep === 5 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileText className="w-4 h-4 text-[#f39223]" />
                    Step 5: Pre-Reading Materials & Assessment Sync
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    LMS Integrated
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Attach lecture handouts and revision slides for your students.
                </p>
              </div>

              <div className="space-y-4">
                {/* Upload & Material Attachment Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Attach Course Study Handouts / Slides
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      value={newMaterialTitle}
                      onChange={(e) => setNewMaterialTitle(e.target.value)}
                      placeholder="e.g. Chapter 4 Calculus Key Formulae Handout.pdf"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#f39223] focus:outline-none"
                    />
                    <select
                      value={newMaterialType}
                      onChange={(e) => setNewMaterialType(e.target.value as any)}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="slide">PPT / Slide Deck</option>
                      <option value="doc">Word / Note</option>
                      <option value="video">Video Reference</option>
                      <option value="link">Web Resource Link</option>
                    </select>
                    <button
                      type="button"
                      onClick={addMaterial}
                      className="px-3.5 py-2 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Attach
                    </button>
                  </div>

                  {/* Material Items List */}
                  <div className="space-y-2">
                    {formData.materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#fff4e6] text-[#c26d15] rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{mat.title}</p>
                            <p className="text-[10px] text-slate-400">
                              {mat.type.toUpperCase()} • {mat.fileSize} • Uploaded {mat.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMaterial(mat.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications & Broadcast Checklist */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#f39223]" />
                    Automated Broadcast & Reminders
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifyStudents}
                        onChange={(e) =>
                          setFormData({ ...formData, notifyStudents: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#f39223] rounded"
                      />
                      <span className="text-slate-700 font-medium">Send push notice to Students</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notifyParents}
                        onChange={(e) =>
                          setFormData({ ...formData, notifyParents: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#f39223] rounded"
                      />
                      <span className="text-slate-700 font-medium">Notify Parents via Portal App</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendCalendarInvite}
                        onChange={(e) =>
                          setFormData({ ...formData, sendCalendarInvite: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#f39223] rounded"
                      />
                      <span className="text-slate-700 font-medium">Sync with Google/Outlook Calendar</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1))}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                activeStep === 1
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous Step
            </button>

            {activeStep < 5 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(prev + 1, 5))}
                className="px-5 py-2.5 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateClass(false)}
                  className="px-5 py-2.5 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Publish Schedule
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateClass(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Launch Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Real-time Live Interactive Student Invitation Card Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#f39223]" />
                <span className="text-xs font-bold text-slate-900">Student Portal Card Preview</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Preview
              </span>
            </div>

            {/* Simulated Student Class Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#f39223] text-white uppercase tracking-wider">
                    {formData.subject}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {formData.title || 'Untitled Online Class Session'}
                  </h3>
                </div>
                <div className="p-2 rounded-xl bg-[#fff4e6] text-[#c26d15] shrink-0">
                  <Video className="w-4 h-4" />
                </div>
              </div>

              {/* Class & Section Meta */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {formData.class} • {formData.section}
                </span>
              </div>

              {/* Timing Grid */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#f39223]" />
                  <span>{formData.date || 'Today'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {formData.startTime} ({formData.durationMinutes}m)
                  </span>
                </div>
              </div>

              {/* Instructor Cardlet */}
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                  alt="Instructor"
                  className="w-8 h-8 rounded-full border border-[#f39223] object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {formData.instructorName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{formData.instructorTitle}</p>
                </div>
              </div>

              {/* Topics Preview */}
              {formData.topics.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.topics.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    {formData.topics.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                        +{formData.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Join Action Simulation Button */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2 bg-[#f39223] hover:bg-[#e08217] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Join Live Lecture
                </button>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-3 bg-[#fff4e6] rounded-xl border border-[#fcd8b3] space-y-1.5 text-xs">
              <span className="font-bold text-[#c26d15] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f39223]" />
                Teacher Tip
              </span>
              <p className="text-[11px] text-[#c26d15] leading-snug">
                You can start a test session anytime by clicking <b>"Start Instantly"</b>. Students in your selected class section will receive immediate portal notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageWrapper>
  );
};
