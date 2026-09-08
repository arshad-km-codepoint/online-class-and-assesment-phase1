import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import {
  Video,
  Radio,
  Play,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowUpRight,
  FileText,
  Library,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  Layers,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Copy,
  AlertCircle,
  Eye,
  Activity,
  CalendarPlus,
} from 'lucide-react';
import type { OnlineClass, LiveInClassAssessment } from '../types';

export const DashboardView: React.FC = () => {
  const {
    portalMode,
    setPortalMode,
    onlineClasses,
    liveAssessments,
    questionPool,
    activeLiveClass,
    startLiveClass,
    setActiveTab,
    selectedChild,
    parentAccount,
    setSelectedChildId,
    addToast,
    openAssessmentSubmissionsReview,
  } = useExam();

  const isTeacher = portalMode === 'teacher';

  // Computed metrics
  const liveClasses = onlineClasses.filter((c) => c.status === 'live');
  const scheduledClasses = onlineClasses.filter((c) => c.status === 'scheduled');
  const completedClasses = onlineClasses.filter((c) => c.status === 'completed');
  const totalEnrolled = onlineClasses.reduce((sum, c) => sum + c.enrolledStudentsCount, 0);

  const activeAssessments = liveAssessments.filter((a) => a.status === 'active');
  const totalSubmissions = liveAssessments.reduce((sum, a) => sum + a.submissions.length, 0);

  // Question Pool distribution
  const typeCounts = {
    mcq: questionPool.filter((q) => q.type === 'mcq').length,
    mmcq: questionPool.filter((q) => q.type === 'mmcq').length,
    fill_in_blanks: questionPool.filter((q) => q.type === 'fill_in_blanks').length,
    match_following: questionPool.filter((q) => q.type === 'match_following').length,
    step_ordering: questionPool.filter((q) => q.type === 'step_ordering').length,
  };

  const copyMeetingLink = (link: string, title: string) => {
    navigator.clipboard.writeText(link);
    addToast('Link Copied', `Meeting link for "${title}" copied to clipboard.`, 'info');
  };

  // -------------------------------------------------------------
  // TEACHER DASHBOARD CONTENT
  // -------------------------------------------------------------
  const renderTeacherDashboard = () => (
    <div className="space-y-6 w-full">
      {/* 1. HERO BANNER & QUICK ACTIONS */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Year 2025-2026 · Term 2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, Prof. Jenkins! 👋
            </h1>
            <p className="text-sm sm:text-base text-amber-100 font-medium">
              You have <span className="font-bold underline decoration-white/60">{liveClasses.length} live session</span> active and <span className="font-bold underline decoration-white/60">{scheduledClasses.length} upcoming lectures</span> scheduled for today.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (liveClasses.length > 0) {
                  startLiveClass(liveClasses[0].id);
                } else if (scheduledClasses.length > 0) {
                  startLiveClass(scheduledClasses[0].id);
                } else {
                  setActiveTab('create-online-class');
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-orange-600 font-bold text-sm shadow-md hover:bg-orange-50 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-orange-600 animate-pulse" />
              <span>{liveClasses.length > 0 ? 'Join Live Studio' : 'Start Instant Class'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create-online-class')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 backdrop-blur-sm transition-all cursor-pointer shadow-xs"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Schedule Class</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create-class-assessment')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm border border-white/30 backdrop-blur-sm transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>

        {/* Decorative background blurs */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-700/30 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. ACTIVE LIVE BROADCAST NOTIFICATION (IF ACTIVE) */}
      {liveClasses.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--status-error-bg)] border border-[var(--status-error-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse-ring">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-error-icon-bg)] text-[var(--status-error-icon)] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[var(--status-error-icon)] text-white">
                  Live Broadcast
                </span>
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {liveClasses[0].subject} · {liveClasses[0].class}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                {liveClasses[0].title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {liveClasses[0].liveAttendanceCount} students connected · Duration {liveClasses[0].durationMinutes} mins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copyMeetingLink(liveClasses[0].meetingLink, liveClasses[0].title)}
              className="p-2.5 rounded-xl border border-[var(--status-error-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] text-xs font-semibold transition cursor-pointer"
              title="Copy meeting link"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => startLiveClass(liveClasses[0].id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Enter Classroom Studio</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. CORE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Online Classes */}
        <div
          onClick={() => setActiveTab('online-classes')}
          className="group bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200/70 dark:ring-amber-800/60 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Online Classes
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {onlineClasses.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({liveClasses.length} live, {scheduledClasses.length} upcoming)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--primary)] group-hover:underline">
            <span>Manage classes</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Interactive Assessments */}
        <div
          onClick={() => setActiveTab('online-class-assessments')}
          className="group bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-1 ring-blue-200/70 dark:ring-blue-800/60 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">
              <span>{activeAssessments.length} Active</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Class Assessments
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {liveAssessments.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({totalSubmissions} submissions)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--primary)] group-hover:underline">
            <span>Review assessments</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Question Pool */}
        <div
          onClick={() => setActiveTab('question-pool')}
          className="group bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-200/70 dark:ring-purple-800/60 flex items-center justify-center">
              <Library className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-full border border-purple-200/80 dark:border-purple-800">
              <span>5 Types</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Question Pool
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {questionPool.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ready items
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--primary)] group-hover:underline">
            <span>Browse question pool</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Enrolled Students */}
        <div
          onClick={() => setActiveTab('online-classes')}
          className="group bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-color)] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200/70 dark:ring-emerald-800/60 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
              <span>96% Attn</span>
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Student Roster
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {totalEnrolled}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                enrolled across classes
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-bold text-[var(--primary)] group-hover:underline">
            <span>View attendance</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT TWO COLUMNS (WIDTH 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today & Upcoming Sessions Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Live & Upcoming Lecture Schedule
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Today's schedule and imminent interactive video sessions
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('online-classes')}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({onlineClasses.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {onlineClasses.slice(0, 4).map((cls) => {
                const isLive = cls.status === 'live';
                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLive
                        ? 'border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-main-light)]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isLive
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-[var(--primary-light)] text-[var(--primary)]'
                        }`}
                      >
                        {isLive ? <Radio className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                            {cls.title}
                          </span>
                          {isLive && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white">
                              Live Now
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-[var(--text-secondary)] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)]">
                            {cls.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>
                              {cls.date} · {cls.startTime} ({cls.durationMinutes}m)
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>
                              {isLive ? cls.liveAttendanceCount : cls.enrolledStudentsCount} students
                            </span>
                          </span>
                          <span className="text-[11px] font-medium text-[var(--text-muted)]">
                            {cls.class} - {cls.section}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => copyMeetingLink(cls.meetingLink, cls.title)}
                        className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition cursor-pointer"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startLiveClass(cls.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isLive
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                            : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow-xs'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>{isLive ? 'Join Studio' : 'Start Class'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive In-Class Assessments Hub Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  Recent In-Class Assessments
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Interactive quizzes dispatched during virtual classes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('create-class-assessment')}
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assessment</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {liveAssessments.slice(0, 3).map((ass) => {
                const isAssActive = ass.status === 'active';
                const submissionCount = ass.submissions.length;
                const avgScore =
                  submissionCount > 0
                    ? Math.round(
                        ass.submissions.reduce((s, sub) => s + sub.percentage, 0) /
                          submissionCount
                      )
                    : 0;

                return (
                  <div
                    key={ass.id}
                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-main-light)] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isAssActive
                            ? 'bg-blue-500 text-white animate-pulse'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                            {ass.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isAssActive
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : ass.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {ass.status}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                            {ass.subject} · {ass.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1 flex-wrap">
                          <span>{ass.questions.length} Questions</span>
                          <span>·</span>
                          <span>{ass.totalMarks} Total Marks</span>
                          <span>·</span>
                          <span>{submissionCount} Submissions</span>
                          {submissionCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Avg: {avgScore}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {submissionCount > 0 && (
                        <button
                          type="button"
                          onClick={() => openAssessmentSubmissionsReview(ass)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="View student submissions in Review Studio"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>Submissions ({submissionCount})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('online-class-assessments')}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (WIDTH 1/3) */}
        <div className="space-y-6">
          {/* Question Pool Breakdown Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 flex items-center justify-center">
                  <Library className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Question Pool Mix
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {questionPool.length} active questions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('question-pool')}
                className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
              >
                Pool
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Single Choice (MCQ)', count: typeCounts.mcq, color: 'bg-blue-500' },
                { label: 'Multi-Select (MMCQ)', count: typeCounts.mmcq, color: 'bg-indigo-500' },
                { label: 'Drag to Blank', count: typeCounts.fill_in_blanks, color: 'bg-emerald-500' },
                { label: 'Match Following', count: typeCounts.match_following, color: 'bg-amber-500' },
                { label: 'Step Ordering Proofs', count: typeCounts.step_ordering, color: 'bg-purple-500' },
              ].map((item, idx) => {
                const pct = questionPool.length > 0 ? Math.round((item.count / questionPool.length) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--text-secondary)]">{item.label}</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-main)] overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setActiveTab('question-pool')}
                className="w-full py-2 px-3 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--sidebar-active)] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question to Pool</span>
              </button>
            </div>
          </div>

          {/* Quick System & Classroom Health Widget */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Classroom Infrastructure
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">HD WebRTC Video Studio</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Interactive Quiz Dispatcher</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Ready</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-secondary)]">Attendance & Proctor AI</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[var(--text-secondary)]">Cloud Lecture Recording</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Auto-Syncing</span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Recent Class Activity
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { text: 'Maya Lin scored 100% on Calculus Quiz', time: '10m ago', icon: Award, color: 'text-amber-500' },
                { text: 'Prof. Jenkins started Advanced Physics live stream', time: '25m ago', icon: Radio, color: 'text-red-500' },
                { text: 'Added 4 new Match-the-Following questions to pool', time: '1h ago', icon: Library, color: 'text-purple-500' },
                { text: 'Chemistry Laboratory Lecture scheduled for 2:30 PM', time: '2h ago', icon: Calendar, color: 'text-blue-500' },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <act.icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${act.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-primary)] font-medium leading-snug">{act.text}</p>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // STUDENT / PARENT DASHBOARD CONTENT
  // -------------------------------------------------------------
  const renderStudentDashboard = () => (
    <div className="space-y-6 w-full">
      {/* 1. STUDENT WELCOME & PROGRESS SNAPSHOT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-orange-600 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {selectedChild.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Student Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Hi, {selectedChild.name}! 🎓
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5">
                {selectedChild.class} · Section {selectedChild.section} · Roll #{selectedChild.rollNo}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="text-center px-3">
              <p className="text-[10px] font-bold uppercase text-amber-200">Attendance</p>
              <p className="text-lg font-black text-white mt-0.5">{selectedChild.attendancePct}%</p>
            </div>
            <div className="text-center px-3 border-x border-white/20">
              <p className="text-[10px] font-bold uppercase text-amber-200">Grade</p>
              <p className="text-lg font-black text-white mt-0.5">{selectedChild.overallGrade}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] font-bold uppercase text-amber-200">Rank</p>
              <p className="text-lg font-black text-white mt-0.5">#{selectedChild.rankInClass}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE LIVE CLASSROOM BROADCAST BANNER */}
      {liveClasses.length > 0 ? (
        <div className="p-5 rounded-2xl bg-red-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-pulse-ring">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-red-600 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/20 text-white">
                Live Class Now In Progress
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {liveClasses[0].title}
              </h3>
              <p className="text-xs text-red-100">
                Instructor: {liveClasses[0].instructorName} · {liveClasses[0].liveAttendanceCount} classmates attending
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => startLiveClass(liveClasses[0].id)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-red-50 text-red-600 font-black text-sm shadow-md transition cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Join Live Lecture</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
            No active lectures right now. Your next class starts at 2:30 PM today.
          </p>
        </div>
      )}

      {/* 3. TODAY'S CLASS TIMETABLE */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Your Virtual Class Timetable
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Today's lecture schedule and access links
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('student-online-classes')}
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Lectures ({onlineClasses.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {onlineClasses.slice(0, 4).map((cls) => {
            const isLive = cls.status === 'live';
            return (
              <div
                key={cls.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  isLive
                    ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-[var(--border-color)] bg-[var(--bg-main)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider">
                      {cls.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLive
                          ? 'bg-red-600 text-white uppercase'
                          : cls.status === 'completed'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLive ? 'Live Now' : cls.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] mt-1">
                    {cls.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {cls.instructorName} · {cls.instructorTitle || 'Faculty'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cls.date} · {cls.startTime} ({cls.durationMinutes} min)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {cls.materials.length} learning resources
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isLive) {
                        startLiveClass(cls.id);
                      } else {
                        setActiveTab('student-online-classes');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isLive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--border-color)] text-[var(--text-primary)]'
                    }`}
                  >
                    {isLive ? 'Join Lecture' : 'View Class Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <PageWrapper
      breadcrumbs={[{ label: 'Dashboard', active: true }]}
      title={isTeacher ? 'Teacher Command Center' : 'Student Learning Dashboard'}
      subtitle={
        isTeacher
          ? 'Real-time overview of online lectures, in-class quizzes, and question pool inventory'
          : `Welcome back, ${selectedChild.name}! Review your live classes, upcoming sessions, and assignments.`
      }
    >
      {isTeacher ? renderTeacherDashboard() : renderStudentDashboard()}
    </PageWrapper>
  );
};
