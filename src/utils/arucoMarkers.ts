// js-aruco2 ships as browser-global scripts (no ES exports), so load the sources as text and
// evaluate them against one shared `this`, exactly as separate <script> tags would.
import cvSource from 'js-aruco2/src/cv.js?raw';
import arucoSource from 'js-aruco2/src/aruco.js?raw';
import dictionarySource from 'js-aruco2/src/dictionaries/aruco_4x4_1000.js?raw';

const DICTIONARY_NAME = 'ARUCO_4X4_1000';
/** Markers 0..MARKER_COUNT-1 of the dictionary are used; plenty for a class and cheap to match. */
export const MARKER_COUNT = 100;

interface ArucoMarker {
  id: number;
  hammingDistance: number;
}
interface RawImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
/** The parts of js-aruco2's detector that detect() chains together; used to run it with other thresholds. */
interface ArucoDetector {
  grey: unknown;
  thres: unknown;
  binary: unknown[];
  contours: unknown[];
  findCandidates: (contours: unknown[], minSize: number, epsilon: number, minLength: number) => unknown[];
  clockwiseCorners: (candidates: unknown[]) => unknown[];
  notTooNear: (candidates: unknown[], minDist: number) => unknown[];
  findMarkers: (grey: unknown, candidates: unknown[], warpSize: number) => ArucoMarker[];
}
interface CvLib {
  grayscale: (image: RawImage, dst: unknown) => void;
  adaptiveThreshold: (src: unknown, dst: unknown, kernelSize: number, threshold: number) => void;
  findContours: (img: unknown, binary: unknown[]) => unknown[];
}
interface ArucoLib {
  Detector: new (config: { dictionaryName: string; maxHammingDistance: number }) => ArucoDetector;
  Dictionary: new (name: string) => { generateSVG: (id: number) => string };
  DICTIONARIES: Record<string, { codeList: unknown[]; tau: number | null }>;
}

let lib: ArucoLib | null = null;
let cv: CvLib | null = null;
let detector: ArucoDetector | null = null;

const loadLib = (): ArucoLib => {
  if (lib) return lib;
  const scope = {};
  new Function(`${cvSource}\n${arucoSource}\n${dictionarySource}`).call(scope);
  const ar = (scope as { AR: ArucoLib; CV: CvLib }).AR;
  cv = (scope as { CV: CvLib }).CV;
  const dict = ar.DICTIONARIES[DICTIONARY_NAME];
  dict.codeList = dict.codeList.slice(0, MARKER_COUNT);
  dict.tau = 3;
  lib = ar;
  return ar;
};

export const markerSvg = (id: number): string => new (loadLib().Dictionary)(DICTIONARY_NAME).generateSVG(id);

export const markerDataUrl = (id: number): string => `data:image/svg+xml;utf8,${encodeURIComponent(markerSvg(id))}`;

/**
 * js-aruco2 hard-codes a 5x5 adaptive-threshold window, which only suits small markers: a marker
 * filling a good part of the frame loses its solid black border and yields no candidate at all.
 * So the frame is scanned several times with different window sizes and image scales.
 */
const PASSES: { scale: number; kernel: number }[] = [
  { scale: 1, kernel: 2 }, // small / distant markers
  { scale: 1, kernel: 12 }, // medium markers
  { scale: 0.5, kernel: 7 }, // large markers
  { scale: 0.3, kernel: 7 }, // markers close to the camera
];
const THRESHOLD = 7;

const subsample = (src: RawImage, scale: number): RawImage => {
  if (scale === 1) return src;
  const width = Math.floor(src.width * scale);
  const height = Math.floor(src.height * scale);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy = Math.floor(y / scale);
    for (let x = 0; x < width; x++) {
      const sx = Math.floor(x / scale);
      const from = (sy * src.width + sx) * 4;
      data.set(src.data.subarray(from, from + 4), (y * width + x) * 4);
    }
  }
  return { width, height, data };
};

/**
 * Returns the ids of every ArUco marker visible in the image. Matching is exact: with a 4x4 grid,
 * tolerating even one flipped bit lets background clutter pass as a marker.
 */
export const detectMarkerIds = (image: RawImage): number[] => {
  const ar = loadLib();
  const cvLib = cv as CvLib;
  detector ??= new ar.Detector({ dictionaryName: DICTIONARY_NAME, maxHammingDistance: 1 });
  const d = detector;
  const ids = new Set<number>();
  for (const { scale, kernel } of PASSES) {
    const img = subsample(image, scale);
    cvLib.grayscale(img, d.grey);
    cvLib.adaptiveThreshold(d.grey, d.thres, kernel, THRESHOLD);
    d.contours = cvLib.findContours(d.thres, d.binary);
    let candidates = d.findCandidates(d.contours, img.width * 0.01, 0.05, 10);
    candidates = d.notTooNear(d.clockwiseCorners(candidates), 10);
    for (const m of d.findMarkers(d.grey, candidates, 49)) ids.add(m.id);
  }
  return [...ids];
};

const escapeHtml = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** A4 print sheet: 6 cards per page (2 x 3), 8 cm markers, dashed cut lines. */
export const buildMarkerSheetHtml = (cards: { markerId: number; name: string; rollNo?: string }[]): string => {
  const items = cards
    .map(
      (c) => `<div class="card"><div class="marker">${markerSvg(c.markerId)}</div>
        <div class="name">${escapeHtml(c.name)}</div><div class="meta">Marker #${c.markerId}${c.rollNo ? ` &middot; Roll ${escapeHtml(c.rollNo)}` : ''}</div></div>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Student ArUco markers</title><style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
    .sheet { display: grid; grid-template-columns: repeat(2, 105mm); grid-auto-rows: 99mm; width: 210mm; }
    .card { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 0.3mm dashed #999; break-inside: avoid; }
    .marker svg { width: 80mm; height: 80mm; display: block; }
    .name { margin-top: 2mm; font-size: 14pt; font-weight: 700; }
    .meta { font-size: 10pt; color: #444; }
  </style></head><body><div class="sheet">${items}</div></body></html>`;
};
