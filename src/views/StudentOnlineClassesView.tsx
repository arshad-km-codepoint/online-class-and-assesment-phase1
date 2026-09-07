import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import {
  Video,
  Play,
  Calendar,
  Clock,
  FileText,
  Radio,
  CheckCircle2,
  Eye,
  Search,
  Download,
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

  const headerActions = liveClasses.length > 0 ? (
    <button
      type="button"
      onClick={() => startLiveClass(liveClasses[0].id)}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm cursor-pointer animate-pulse"
    >
      <Radio className="w-4 h-4 text-white" />
      <span>Join Active Live Lecture</span>
    </button>
  ) : undefined;

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Dashboard' },
        { label: 'Online Classes', active: true },
      ]}
      title="Live Classes & Lecture Archive"
      subtitle={`Student: ${selectedChild.name} (${selectedChild.class} - ${selectedChild.section}) · Attend real-time lectures, access materials & review recordings`}
      actions={headerActions}
    >
      <div className="space-y-6 w-full">
        {/* Filter Toolbar (Section 5.E Blueprint) */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm p-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[var(--bg-main)] p-1 rounded-xl text-xs font-bold overflow-x-auto border border-[var(--border-color)]">
            {[
              { id: 'all', label: `All Sessions (${onlineClasses.length})` },
              { id: 'live', label: `Live Now (${liveClasses.length})` },
              { id: 'upcoming', label: `Upcoming Schedule (${upcomingClasses.length})` },
              { id: 'recordings', label: `Past Recordings (${recordedClasses.length})` },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[var(--bg-card)] text-[var(--primary)] font-bold shadow-xs border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search class or subject..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
                className={`bg-[var(--bg-card)] rounded-2xl border transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] flex flex-col justify-between overflow-hidden shadow-sm ${
                  isLive
                    ? 'border-[var(--status-error-border)] ring-2 ring-[var(--status-error-icon)]/20'
                    : 'border-[var(--border-color)]'
                }`}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-hover)] border border-[var(--primary)] uppercase tracking-wider">
                      {cls.subject}
                    </span>

                    {/* Status Badges from Section 5.D */}
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-error-icon)]" />
                        LIVE NOW
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                        <CheckCircle2 className="w-3 h-3 text-[var(--text-muted)]" />
                        Recorded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ecfdf3] text-[#166534] border border-[#bbf7d0]">
                        <Calendar className="w-3 h-3 text-[#15803d]" />
                        Upcoming
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  {/* Timing & Platform Box */}
                  <div className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[var(--text-secondary)] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {cls.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {cls.startTime} ({cls.durationMinutes}m)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-color)] text-[11px] text-[var(--text-secondary)]">
                      <span>Teacher: {cls.instructorName}</span>
                      <span className="font-bold text-[var(--primary-hover)]">Passcode: {cls.passcode || 'STUDENT'}</span>
                    </div>
                  </div>

                  {/* Materials List */}
                  {cls.materials.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Study Materials ({cls.materials.length})
                      </span>
                      {cls.materials.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => addToast('Downloading File', `Saved ${m.title}`, 'success')}
                          className="p-2 bg-[var(--bg-main)] hover:bg-[var(--primary-light)]/40 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {m.title}
                          </span>
                          <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="p-3.5 bg-[var(--bg-main)] border-t border-[var(--border-color)]">
                  {isLive ? (
                    <button
                      type="button"
                      onClick={() => startLiveClass(cls.id)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-pulse transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Join Live Classroom Now
                    </button>
                  ) : isCompleted ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (cls.recordingUrl) {
                          window.open(cls.recordingUrl, '_blank');
                        } else {
                          addToast('Playback Ready', 'Simulating lecture archive stream', 'info');
                        }
                      }}
                      className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-[var(--text-primary)] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                      Watch Lecture Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        addToast(
                          'Class Scheduled',
                          `This lecture begins on ${cls.date} at ${cls.startTime}. A reminder will be sent 15 mins prior.`,
                          'info'
                        )
                      }
                      className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Starts {cls.date} @ {cls.startTime}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
};
