import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScanLine, Grid2x2, Search, Download, UserCheck, UserX, Wand2, Printer } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { PageWrapper } from '../components/layout/PageWrapper';
import { MarkerScannerModal } from '../components/modals/MarkerScannerModal';
import { mockEligibleStudents } from '../data/mockData';
import { MARKER_COUNT, buildMarkerSheetHtml, markerDataUrl, markerSvg } from '../utils/arucoMarkers';
import type { RecipientStudent } from '../types';

const beep = () => {
  try {
    const ac = new AudioContext();
    const osc = ac.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.12);
    setTimeout(() => ac.close(), 300);
  } catch {
    /* audio is optional */
  }
};

const downloadMarker = (student: RecipientStudent, markerId: number) => {
  const url = URL.createObjectURL(new Blob([markerSvg(markerId)], { type: 'image/svg+xml' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `marker-${markerId}-${student.name.replace(/\s+/g, '-')}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

const MarkerCard: React.FC<{ student: RecipientStudent; markerId: number }> = ({ student, markerId }) => (
  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
    <img src={markerDataUrl(markerId)} alt={`ArUco marker ${markerId}`} className="h-36 w-36 rounded-lg" style={{ imageRendering: 'pixelated' }} />
    <p className="text-center text-xs font-bold text-[var(--text-primary)]">{student.name}</p>
    <p className="text-[10px] text-[var(--text-muted)]">Marker #{markerId} · Roll {student.rollNo}</p>
    <button type="button" onClick={() => downloadMarker(student, markerId)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] cursor-pointer">
      <Download size={12} /> SVG
    </button>
  </div>
);

export const AttendanceView: React.FC = () => {
  const { onlineClasses, attendance, setAttendanceStatus, markerAllocations, allocateMarker, autoAllocateMarkers, addToast } = useExam();
  const [classId, setClassId] = useState(onlineClasses[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const cls = onlineClasses.find((c) => c.id === classId);
  const roster = useMemo(() => {
    if (!cls) return mockEligibleStudents;
    const match = mockEligibleStudents.filter((s) => cls.class.includes(s.class.replace('Grade ', '')) || s.class === cls.class);
    return match.length ? match : mockEligibleStudents;
  }, [cls]);

  const records = attendance[classId] ?? {};
  const presentCount = roster.filter((s) => records[s.id]).length;
  const visible = roster.filter((s) => `${s.name} ${s.rollNo} ${s.admissionNo}`.toLowerCase().includes(search.toLowerCase()));
  const usedMarkers = new Set(Object.values(markerAllocations));
  const unallocatedCount = roster.filter((s) => markerAllocations[s.id] === undefined).length;

  // The scanner callback is long-lived, so read the latest roster/records/allocations via refs.
  const live = useRef({ roster, records, markerAllocations });
  useEffect(() => {
    live.current = { roster, records, markerAllocations };
  });

  const handleScan = (markerId: number) => {
    const { roster: r, records: rec, markerAllocations: alloc } = live.current;
    const student = r.find((s) => alloc[s.id] === markerId);
    if (!student) {
      const elsewhere = Object.values(alloc).includes(markerId);
      addToast(
        elsewhere ? 'Not in this class' : 'Unassigned marker',
        elsewhere ? `Marker #${markerId} belongs to a student outside this class.` : `Marker #${markerId} is not allocated to any student.`,
        'danger'
      );
      return;
    }
    if (rec[student.id]) {
      addToast('Already marked', `${student.name} is already present.`, 'info');
      return;
    }
    setAttendanceStatus(classId, student.id, true, 'marker');
    beep();
    addToast('Marked present', `${student.name} (Roll ${student.rollNo}) · marker #${markerId}`, 'success');
  };

  const printSheet = () => {
    const cards = roster.flatMap((s) => (markerAllocations[s.id] === undefined ? [] : [{ markerId: markerAllocations[s.id], name: s.name, rollNo: s.rollNo }]));
    if (cards.length === 0) {
      addToast('Nothing to print', 'Allocate markers to students first.', 'warning');
      return;
    }
    const win = window.open('', '_blank');
    if (!win) {
      addToast('Pop-up blocked', 'Allow pop-ups for this site to open the print sheet.', 'warning');
      return;
    }
    win.document.write(buildMarkerSheetHtml(cards));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const changeMarker = (student: RecipientStudent, value: string) => {
    const next = value === '' ? null : Number(value);
    if (!allocateMarker(student.id, next)) addToast('Marker in use', `Marker #${next} is already allocated to another student.`, 'danger');
  };

  const stats: [string, number, string][] = [
    ['Present', presentCount, 'text-emerald-600'],
    ['Absent', roster.length - presentCount, 'text-rose-600'],
    ['Total', roster.length, 'text-[var(--text-primary)]'],
  ];

  return (
    <PageWrapper
      title="Marker Attendance"
      subtitle="Each student holds an ArUco marker. Scan the room's markers with the camera to mark attendance."
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowCards((v) => !v)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
            <Grid2x2 size={15} /> {showCards ? 'Hide' : 'Student'} Marker Cards
          </button>
          <button type="button" onClick={() => setScanning(true)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white cursor-pointer">
            <ScanLine size={15} /> Scan Markers
          </button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] items-end">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Class session
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-[var(--text-primary)]">
            {onlineClasses.map((c) => (
              <option key={c.id} value={c.id}>{c.title} — {c.class} {c.section} · {c.date}</option>
            ))}
          </select>
        </label>
        {stats.map(([label, n, color]) => (
          <div key={label} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-2 text-center">
            <p className={`text-xl font-extrabold ${color}`}>{n}</p>
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {showCards && (
        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Marker cards (print or show on a screen to test)</h3>
            <div className="flex gap-2">
            <button type="button" onClick={printSheet} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer">
              <Printer size={13} /> Print A4 sheet
            </button>
            <button
              type="button"
              disabled={unallocatedCount === 0}
              onClick={() => autoAllocateMarkers(roster.map((s) => s.id), MARKER_COUNT - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-primary)] disabled:opacity-50 cursor-pointer"
            >
              <Wand2 size={13} /> Auto-allocate {unallocatedCount} unassigned
            </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {roster.map((s) => {
              const id = markerAllocations[s.id];
              return id === undefined ? null : <MarkerCard key={s.id} student={s} markerId={id} />;
            })}
          </div>
        </section>
      )}

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, roll no or admission no" className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] outline-none focus:border-orange-400" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
        {visible.map((s) => {
          const rec = records[s.id];
          const marker = markerAllocations[s.id];
          return (
            <div key={s.id} className="flex flex-wrap items-center gap-3 border-b border-[var(--border-color)] px-4 py-3 last:border-b-0">
              {s.photoUrl ? (
                <img src={s.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[var(--bg-main)]" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">{s.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">Roll {s.rollNo} · {s.admissionNo}</p>
              </div>
              <div className="flex items-center gap-2">
                {marker !== undefined ? (
                  <img src={markerDataUrl(marker)} alt="" className="h-9 w-9 rounded border border-[var(--border-color)]" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">none</div>
                )}
                <select
                  value={marker ?? ''}
                  onChange={(e) => changeMarker(s, e.target.value)}
                  aria-label={`Marker allocated to ${s.name}`}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
                >
                  <option value="">Unassigned</option>
                  {Array.from({ length: MARKER_COUNT }, (_, id) => id)
                    .filter((id) => id === marker || !usedMarkers.has(id))
                    .map((id) => (
                      <option key={id} value={id}>Marker #{id}</option>
                    ))}
                </select>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${rec ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {rec ? `Present · ${new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${rec.method === 'manual' ? ' (manual)' : ''}` : 'Absent'}
              </span>
              <button
                type="button"
                onClick={() => setAttendanceStatus(classId, s.id, !rec, 'manual')}
                aria-label={rec ? `Mark ${s.name} absent` : `Mark ${s.name} present`}
                className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-main)] cursor-pointer"
              >
                {rec ? <UserX size={15} /> : <UserCheck size={15} />}
              </button>
            </div>
          );
        })}
        {visible.length === 0 && <p className="p-6 text-center text-sm text-[var(--text-muted)]">No students found.</p>}
      </div>

      <MarkerScannerModal open={scanning} onClose={() => setScanning(false)} onScan={handleScan} />
    </PageWrapper>
  );
};
