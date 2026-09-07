import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { OnlineClass, OnlineClassStatus } from '../types';
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
  ExternalLink,
  BookOpen,
  CheckCircle2,
  FileText,
  Radio,
  Sparkles,
  Shield,
  MoreVertical,
  Layers,
  GraduationCap,
  Eye,
  Tv,
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

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* Header & New Class Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            Online Classes & Virtual Lectures
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule live virtual sessions, launch instant HD streaming classrooms, and manage student attendance
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('online-class-assessments')}
            className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Class Assessments</span>
          </button>

          <button
            onClick={() => setActiveTab('create-class-assessment')}
            className="px-3.5 py-2.5 bg-purple-50 border border-purple-300 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>+ Create Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('create-online-class')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Online Class</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Live Classes Now
            </span>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{liveClasses.length}</p>
          <span className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
            Active live broadcast in session
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Scheduled Ahead
            </span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{scheduledClasses.length}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Upcoming timetable lectures
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Learners
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{totalEnrolled}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Across {onlineClasses.length} registered classes
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Past Recordings
            </span>
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">{completedClasses.length}</p>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
            Available in student archive
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            {[
              { id: 'all', label: `All Classes (${onlineClasses.length})` },
              { id: 'live', label: `Live Now (${liveClasses.length})`, badgeColor: 'text-red-600' },
              { id: 'scheduled', label: `Upcoming (${scheduledClasses.length})` },
              { id: 'completed', label: `Completed (${completedClasses.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                } ${tab.badgeColor || ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic, subject, teacher..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
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
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="all">All Classes</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 12">Class 12</option>
          </select>

          {(subjectFilter !== 'all' || classFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSubjectFilter('all');
                setClassFilter('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Online Classes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No virtual sessions match your current filter criteria. Create a new online class to get started.
          </p>
          <button
            onClick={() => setActiveTab('create-online-class')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
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
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isLive
                    ? 'border-red-300 ring-2 ring-red-500/20 shadow-red-500/5'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Badge & Subject Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-600 text-white uppercase tracking-wider">
                        {cls.subject}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {cls.class} • {cls.section}
                      </span>
                    </div>

                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        LIVE NOW
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-slate-400" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        Scheduled
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  {/* Topics Pills */}
                  {cls.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cls.topics.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                      {cls.topics.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-medium">
                          +{cls.topics.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Timing & Platform Details Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {cls.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {cls.startTime} ({cls.durationMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        {cls.platform === 'in_app'
                          ? 'EduStream Native HD'
                          : cls.platform === 'google_meet'
                          ? 'Google Meet'
                          : cls.platform === 'zoom'
                          ? 'Zoom Meetings'
                          : 'Microsoft Teams'}
                      </span>
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
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
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{cls.instructorName}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {cls.instructorTitle || 'Course Instructor'}
                      </p>
                    </div>

                    {/* Materials Count Pill */}
                    {cls.materials.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {cls.materials.length} Files
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyMeetingLink(cls.meetingLink, cls.title)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
                      title="Copy Student Invite Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateOnlineClass(cls.id)}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-colors"
                      title="Duplicate Class"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOnlineClass(cls.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/20 animate-pulse transition-all"
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
                      className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      View Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startLiveClass(cls.id)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
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
  );
};
