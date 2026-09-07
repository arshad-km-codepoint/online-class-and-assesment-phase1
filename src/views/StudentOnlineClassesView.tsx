import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Video,
  Play,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Radio,
  CheckCircle2,
  Users,
  Eye,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Download,
  Lock,
} from 'lucide-react';

export const StudentOnlineClassesView: React.FC = () => {
  const { onlineClasses, selectedChild, startLiveClass, addToast } = useExam();

  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'upcoming' | 'recordings'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const liveClasses = onlineClasses.filter((c) => c.status === 'live');
  const upcomingClasses = onlineClasses.filter((c) => c.status === 'scheduled');
  const recordedClasses = onlineClasses.filter((c) => c.status === 'completed');

  const filtered = onlineClasses.filter((c) => {
    const matchesTab =
      activeFilter === 'all' ||
      (activeFilter === 'live' && c.status === 'live') ||
      (activeFilter === 'upcoming' && c.status === 'scheduled') ||
      (activeFilter === 'recordings' && c.status === 'completed');

    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Student Live Classroom Portal
              </span>
              <span className="text-xs font-semibold text-emerald-200">
                Student: {selectedChild.name} ({selectedChild.class} - {selectedChild.section})
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-emerald-400" />
              Live Classes & Lecture Archive
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-xl mt-1">
              Attend real-time streaming lectures, interact with subject teachers, download class notes & watch past recordings.
            </p>
          </div>

          {liveClasses.length > 0 && (
            <button
              onClick={() => startLiveClass(liveClasses[0].id)}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-600/40 flex items-center gap-2 animate-bounce"
            >
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span>Join Active Live Lecture</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'all', label: `All Sessions (${onlineClasses.length})` },
            { id: 'live', label: `Live Now (${liveClasses.length})`, color: 'text-red-600' },
            { id: 'upcoming', label: `Upcoming Schedule (${upcomingClasses.length})` },
            { id: 'recordings', label: `Past Recordings (${recordedClasses.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              } ${tab.color || ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class or subject..."
            className="pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cls) => {
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
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-700 text-white uppercase tracking-wider">
                    {cls.subject}
                  </span>

                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      LIVE NOW
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      Recorded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <Calendar className="w-3 h-3 text-emerald-600" />
                      Upcoming
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cls.description}
                  </p>
                </div>

                {/* Timing & Platform Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {cls.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {cls.startTime} ({cls.durationMinutes}m)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>Teacher: {cls.instructorName}</span>
                    <span className="font-bold text-emerald-700">Passcode: {cls.passcode || 'STUDENT'}</span>
                  </div>
                </div>

                {/* Materials List */}
                {cls.materials.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Study Materials ({cls.materials.length})
                    </span>
                    {cls.materials.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => addToast('Downloading File', `Saved ${m.title}`, 'success')}
                        className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-900 flex items-center justify-between cursor-pointer transition-all"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          {m.title}
                        </span>
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200">
                {isLive ? (
                  <button
                    onClick={() => startLiveClass(cls.id)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-red-600/30 animate-pulse transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Join Live Classroom Now
                  </button>
                ) : isCompleted ? (
                  <button
                    onClick={() => {
                      if (cls.recordingUrl) {
                        window.open(cls.recordingUrl, '_blank');
                      } else {
                        addToast('Playback Ready', 'Simulating lecture archive stream', 'info');
                      }
                    }}
                    className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    Watch Lecture Recording
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      addToast(
                        'Class Scheduled',
                        `This lecture begins on ${cls.date} at ${cls.startTime}. A reminder will be sent 15 mins prior.`,
                        'info'
                      )
                    }
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Starts {cls.date} @ {cls.startTime}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
