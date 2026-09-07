import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import {
  Video,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Play,
  Copy,
  Trash2,
  BookOpen,
  CheckCircle2,
  FileText,
  Radio,
  Sparkles,
  Eye,
  RotateCcw,
} from 'lucide-react';

export const OnlineClassesListView: React.FC = () => {
  const {
    onlineClasses,
    setActiveTab,
    startLiveClass,
    deleteOnlineClass,
    duplicateOnlineClass,
    addToast,
  } = useExam();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const liveClasses = onlineClasses.filter((c) => c.status === 'live');
  const scheduledClasses = onlineClasses.filter((c) => c.status === 'scheduled');
  const completedClasses = onlineClasses.filter((c) => c.status === 'completed');

  const totalEnrolled = onlineClasses.reduce((sum, c) => sum + c.enrolledStudentsCount, 0);

  const filteredClasses = onlineClasses.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || c.subject === subjectFilter;
    const matchesClass = classFilter === 'all' || c.class === classFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.class.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSubject && matchesClass && matchesSearch;
  });

  const copyMeetingLink = (link: string, title: string) => {
    navigator.clipboard.writeText(link);
    addToast('Link Copied', `Invite link for "${title}" copied to clipboard!`, 'info');
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={() => setActiveTab('online-class-assessments')}
        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition cursor-pointer flex items-center gap-2"
      >
        <FileText className="w-4 h-4 text-[var(--primary)]" />
        <span>Class Assessments</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('create-class-assessment')}
        className="rounded-xl border border-[var(--primary)] bg-[var(--primary-light)] px-4 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--sidebar-active)] transition cursor-pointer flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
        <span>+ Create Assessment</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('create-online-class')}
        className="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create Online Class</span>
      </button>
    </>
  );

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard', onClick: () => setActiveTab('dashboard') },
        { label: 'Online Classes', active: true },
      ]}
      title="Online Classes & Virtual Lectures"
      subtitle="Schedule live virtual sessions, launch instant HD streaming classrooms, and manage student attendance"
      actions={headerActions}
    >
      <div className="space-y-6 w-full">
        {/* 4 Summary Stat Cards (Section 5.C Blueprint) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-card)] p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center gap-3 sm:gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--status-error-icon-bg)] text-[var(--status-error-icon)] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Live Classes Now
              </p>
              <p className="text-xl sm:text-2xl font-black text-[var(--status-error-icon)] mt-1 break-words">
                {liveClasses.length}
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center gap-3 sm:gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Scheduled Ahead
              </p>
              <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 break-words">
                {scheduledClasses.length}
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center gap-3 sm:gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--status-success-icon-bg)] text-[var(--status-success-icon)] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Enrolled Learners
              </p>
              <p className="text-xl sm:text-2xl font-black text-[var(--status-success-text)] mt-1 break-words">
                {totalEnrolled}
              </p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center gap-3 sm:gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--status-warning-icon-bg)] text-[var(--status-warning-icon)] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Past Recordings
              </p>
              <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 break-words">
                {completedClasses.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar (Section 5.E Toolbar Blueprint) */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm p-4 sm:px-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-main)] p-1 rounded-xl text-xs font-bold overflow-x-auto border border-[var(--border-color)]">
              {[
                { id: 'all', label: `All Classes (${onlineClasses.length})` },
                { id: 'live', label: `Live Now (${liveClasses.length})` },
                { id: 'scheduled', label: `Upcoming (${scheduledClasses.length})` },
                { id: 'completed', label: `Completed (${completedClasses.length})` },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[var(--bg-card)] text-[var(--primary)] font-bold shadow-xs border border-[var(--border-color)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input with Icon */}
            <div className="relative flex-1 max-w-xs">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic, subject, teacher..."
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--border-color)] text-xs">
            <span className="text-[var(--text-muted)] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Biology">Biology</option>
              <option value="English Literature">English Literature</option>
            </select>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="all">All Classes</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 12">Class 12</option>
            </select>

            {(subjectFilter !== 'all' || classFilter !== 'all' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSubjectFilter('all');
                  setClassFilter('all');
                  setSearchTerm('');
                }}
                className="text-[var(--primary)] hover:underline font-semibold ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Class Cards Grid */}
        {filteredClasses.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">No Online Classes Found</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              No virtual sessions match your current filter criteria. Create a new online class to get started.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('create-online-class')}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              + Create First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClasses.map((cls) => {
              const isLive = cls.status === 'live';
              const isCompleted = cls.status === 'completed';

              return (
                <div
                  key={cls.id}
                  className={`bg-[var(--bg-card)] rounded-2xl border transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] flex flex-col justify-between overflow-hidden shadow-sm ${
                    isLive
                      ? 'border-[var(--status-error-border)] ring-2 ring-[var(--status-error-icon)]/20'
                      : 'border-[var(--border-color)]'
                  }`}
                >
                  {/* Top Badge & Subject Header */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-hover)] border border-[var(--primary)] uppercase tracking-wider">
                          {cls.subject}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-main)] px-2.5 py-0.5 rounded-full border border-[var(--border-color)]">
                          {cls.class} • {cls.section}
                        </span>
                      </div>

                      {/* Status Badges from Section 5.D */}
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-error-icon)]" />
                          LIVE NOW
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-[var(--text-muted)]" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ecfdf3] text-[#166534] border border-[#bbf7d0]">
                          <Calendar className="w-3 h-3 text-[#15803d]" />
                          Scheduled
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                        {cls.description}
                      </p>
                    </div>

                    {/* Topics Pills */}
                    {cls.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cls.topics.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-md font-semibold border border-[var(--border-color)]"
                          >
                            {t}
                          </span>
                        ))}
                        {cls.topics.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-[var(--text-muted)] font-medium">
                            +{cls.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Timing & Platform Details Box */}
                    <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[var(--text-secondary)] font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                          {cls.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                          <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                          {cls.startTime} ({cls.durationMinutes}m)
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[11px]">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {cls.platform === 'in_app'
                            ? 'EduStream Native HD'
                            : cls.platform === 'google_meet'
                            ? 'Google Meet'
                            : cls.platform === 'zoom'
                            ? 'Zoom Meetings'
                            : 'Microsoft Teams'}
                        </span>
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[var(--status-success-icon)]" />
                          {isLive
                            ? `${cls.liveAttendanceCount}/${cls.enrolledStudentsCount} Present`
                            : `${cls.enrolledStudentsCount} Enrolled`}
                        </span>
                      </div>
                    </div>

                    {/* Instructor Footer */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <img
                        src={
                          cls.instructorAvatar ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={cls.instructorName}
                        className="w-8 h-8 rounded-full border border-[var(--border-color)] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">{cls.instructorName}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate">
                          {cls.instructorTitle || 'Course Instructor'}
                        </p>
                      </div>

                      {/* Materials Count Pill */}
                      {cls.materials.length > 0 && (
                        <span className="text-[10px] font-bold text-[var(--primary-hover)] bg-[var(--primary-light)] px-2 py-1 rounded-lg border border-[var(--primary)] flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {cls.materials.length} Files
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer Bar */}
                  <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyMeetingLink(cls.meetingLink, cls.title)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors cursor-pointer"
                        title="Copy Student Invite Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateOnlineClass(cls.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors cursor-pointer"
                        title="Duplicate Class"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteOnlineClass(cls.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-secondary)] hover:text-[var(--status-error-icon)] hover:bg-[var(--status-error-bg)] transition-colors cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Primary Launch / Join Button */}
                    {isLive ? (
                      <button
                        type="button"
                        onClick={() => startLiveClass(cls.id)}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Enter Live Studio
                      </button>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (cls.recordingUrl) {
                            window.open(cls.recordingUrl, '_blank');
                          } else {
                            addToast('Recording Ready', 'Simulating lecture playback archive', 'info');
                          }
                        }}
                        className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                        View Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startLiveClass(cls.id)}
                        className="px-4 py-1.5 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Class Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
