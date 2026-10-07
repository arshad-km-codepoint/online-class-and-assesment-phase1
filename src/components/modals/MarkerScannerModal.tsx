import React, { useEffect, useRef, useState } from 'react';
import { X, CameraOff } from 'lucide-react';
import { detectMarkerIds, MARKER_COUNT } from '../../utils/arucoMarkers';

interface MarkerScannerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the id of each ArUco marker seen (repeats of the same marker are debounced). */
  onScan: (markerId: number) => void;
}

const SCAN_INTERVAL_MS = 150;
const REPEAT_WINDOW_MS = 3000;
/** Frames are shrunk to this width before detection; HD frames only add cost. */
const MAX_FRAME_WIDTH = 640;
/** A marker must be seen in this many consecutive scans before it counts; one-frame ghosts are ignored. */
const REQUIRED_STREAK = 3;

export const MarkerScannerModal: React.FC<MarkerScannerModalProps> = ({ open, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState('');

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;
    let lastScan = 0;
    const lastSeen = new Map<number, number>();
    let streaks = new Map<number, number>();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      const video = videoRef.current;
      const now = Date.now();
      if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA && now - lastScan >= SCAN_INTERVAL_MS) {
        lastScan = now;
        const ratio = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * ratio);
        canvas.height = Math.round(video.videoHeight * ratio);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const nextStreaks = new Map<number, number>();
          for (const id of detectMarkerIds(img)) {
            const streak = (streaks.get(id) ?? 0) + 1;
            nextStreaks.set(id, streak);
            if (streak < REQUIRED_STREAK) continue;
            if (now - (lastSeen.get(id) ?? 0) > REPEAT_WINDOW_MS) onScanRef.current(id);
            lastSeen.set(id, now);
          }
          streaks = nextStreaks;
        } catch {
          /* a failed frame is skipped */
        }
      }
      if (!cancelled) raf = requestAnimationFrame(tick);
    };

    (async () => {
      setError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera is not available in this browser (HTTPS or localhost required).');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        raf = requestAnimationFrame(tick);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to access the camera.');
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Scan student markers">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Scan student markers</h2>
          <button type="button" onClick={onClose} aria-label="Close scanner" className="p-1.5 rounded-lg hover:bg-[var(--bg-main)] cursor-pointer text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>
        <div className="relative aspect-square bg-black">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
              <CameraOff size={32} />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80" />
            </>
          )}
        </div>
        <form
          className="flex gap-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const id = Number(manual.trim());
            if (manual.trim() && Number.isInteger(id) && id >= 0 && id < MARKER_COUNT) onScan(id);
            setManual('');
          }}
        >
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="Or type a marker ID, e.g. 7"
            className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-orange-400"
          />
          <button type="submit" className="rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-bold text-white cursor-pointer">
            Mark
          </button>
        </form>
        <p className="px-4 pb-4 text-[11px] text-[var(--text-muted)]">
          Hold up several markers at once, or scan students one after another. Keep each marker flat with its white border visible.
        </p>
      </div>
    </div>
  );
};
