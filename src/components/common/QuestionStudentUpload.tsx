import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  FileCheck,
  X,
  Eye,
  Camera,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { StudentQuestionAttachment } from '../../types';

interface QuestionStudentUploadProps {
  questionId: string;
  questionNumber?: number | string;
  attachments: StudentQuestionAttachment[];
  onAddAttachment: (attachment: StudentQuestionAttachment) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  accentColor?: 'amber' | 'purple' | 'indigo' | 'emerald' | 'blue';
  readOnly?: boolean;
  label?: string;
  helperText?: string;
}

// Sample realistic rough work presets for quick demonstration in calculus / math
const SAMPLE_PRESETS: Record<string, { label: string; name: string; size: string; type: string; url: string }> = {
  sequence_proof: {
    label: 'Sequence Proof',
    name: 'Quadratic_Factoring_Proof_Notes.png',
    size: '1.5 MB',
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
  },
  chain_rule: {
    label: 'Chain Rule Notes',
    name: 'Chain_Rule_Rough_Calculations.png',
    size: '1.2 MB',
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1000&auto=format&fit=crop&q=80',
  },
  derivative_table: {
    label: 'Derivatives Table',
    name: 'Derivatives_Working_Steps_Sheet.png',
    size: '1.8 MB',
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1000&auto=format&fit=crop&q=80',
  },
  match_scratch: {
    label: 'Match Scratchpad',
    name: 'Match_Pairs_Scratchpad.pdf',
    size: '1.4 MB',
    type: 'application/pdf',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
  },
  blanks_identities: {
    label: 'Identities Sheet',
    name: 'Calculus_Identities_Scratchpad.pdf',
    size: '1.1 MB',
    type: 'application/pdf',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
  },
  notebook_scan: {
    label: 'Notebook Scan',
    name: 'Handwritten_Solution_Notes.jpg',
    size: '950 KB',
    type: 'image/jpeg',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
  },
  pdf_proof: {
    label: 'Full PDF Proof',
    name: 'Calculus_Step_By_Step_Proof.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80',
  },
};

export const QuestionStudentUpload: React.FC<QuestionStudentUploadProps> = ({
  questionId,
  questionNumber,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  accentColor = 'purple',
  readOnly = false,
  label = 'Attach Student Rough Work / Solution Notes',
  helperText = 'Upload photos of your notebook, rough calculations, or PDF sheet (PNG, JPG, PDF up to 10MB)',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<StudentQuestionAttachment | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Color mappings
  const colorMap = {
    amber: {
      accent: 'text-[#c26d15]',
      border: 'border-[#fcd8b3]',
      bg: 'bg-[#fff4e6]/50',
      activeBorder: 'border-[#f39223]',
      tagBg: 'bg-[#fff4e6] text-[#c26d15] border-[#fcd8b3]',
      button: 'bg-[#f39223] hover:bg-[#e08217] text-white',
      ring: 'focus:ring-[#f39223]',
    },
    purple: {
      accent: 'text-purple-700',
      border: 'border-purple-200',
      bg: 'bg-purple-50/40',
      activeBorder: 'border-purple-500',
      tagBg: 'bg-purple-100 text-purple-800 border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      ring: 'focus:ring-purple-500',
    },
    indigo: {
      accent: 'text-indigo-700',
      border: 'border-indigo-200',
      bg: 'bg-indigo-50/40',
      activeBorder: 'border-indigo-500',
      tagBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      ring: 'focus:ring-indigo-500',
    },
    emerald: {
      accent: 'text-emerald-700',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/40',
      activeBorder: 'border-emerald-500',
      tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      ring: 'focus:ring-emerald-500',
    },
    blue: {
      accent: 'text-blue-700',
      border: 'border-blue-200',
      bg: 'bg-blue-50/40',
      activeBorder: 'border-blue-500',
      tagBg: 'bg-blue-100 text-blue-800 border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      ring: 'focus:ring-blue-500',
    },
  }[accentColor] || {
    accent: 'text-purple-700',
    border: 'border-purple-200',
    bg: 'bg-purple-50/40',
    activeBorder: 'border-purple-500',
    tagBg: 'bg-purple-100 text-purple-800 border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    ring: 'focus:ring-purple-500',
  };

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const fileUrl = (e.target?.result as string) || '';
        const sizeFormatted =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        const newAttachment: StudentQuestionAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: sizeFormatted,
          type: file.type || (isImage ? 'image/jpeg' : 'application/pdf'),
          url: fileUrl,
          previewUrl: isImage ? fileUrl : undefined,
          uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        onAddAttachment(newAttachment);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        // For PDF / non-images, create mock representation or dataURL
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (readOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Quick preset sample attachment
  const handleAddPreset = (presetKey: keyof typeof SAMPLE_PRESETS) => {
    const preset = SAMPLE_PRESETS[presetKey];
    if (!preset) return;

    const newAttachment: StudentQuestionAttachment = {
      id: `att-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name,
      size: preset.size,
      type: preset.type,
      url: preset.url,
      previewUrl: preset.url,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddAttachment(newAttachment);
  };

  // Camera capture simulation
  const handleSimulateCameraCapture = () => {
    setIsCameraActive(true);
    setCameraCountdown(3);
    const interval = setInterval(() => {
      setCameraCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setIsCameraActive(false);
          setCameraCountdown(null);
          // Add captured rough page
          handleAddPreset('notebook_scan');
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Detect most relevant preset based on question ID or number
  const bestPresetKey: keyof typeof SAMPLE_PRESETS = (() => {
    const qLower = (questionId || '').toLowerCase();
    if (qLower.includes('seq') || qLower.includes('step') || questionNumber === 5) return 'sequence_proof';
    if (qLower.includes('blank') || qLower.includes('3') || questionNumber === 4) return 'blanks_identities';
    if (qLower.includes('match') || qLower.includes('2') || questionNumber === 3) return 'match_scratch';
    if (qLower.includes('mmcq') || questionNumber === 2) return 'derivative_table';
    return 'chain_rule';
  })();

  return (
    <div className={`mt-3 pt-3 border-t ${colorMap.border} rounded-xl bg-white/70 p-3.5 space-y-3`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorMap.tagBg} flex items-center justify-center shrink-0`}>
            <Paperclip className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              {label}
              <span className="text-[10px] font-semibold text-slate-400 font-normal">
                (Optional Working)
              </span>
            </span>
            <p className="text-[10px] text-slate-500 leading-tight">{helperText}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              attachments.length > 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {attachments.length === 0 ? 'No files attached' : `${attachments.length} ${attachments.length === 1 ? 'file' : 'files'} attached`}
          </span>
        </div>
      </div>

      {/* Upload Box (Only if not readOnly) */}
      {!readOnly && (
        <div className="space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
              isDragOver
                ? `${colorMap.activeBorder} ${colorMap.bg} ring-2 scale-[1.005]`
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.txt"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">
                  Drag & drop your handwritten working or rough sheet here, or
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 hover:border-purple-400 hover:bg-purple-50/30 text-slate-700 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  <span>Browse Device</span>
                </button>

                <button
                  type="button"
                  onClick={handleSimulateCameraCapture}
                  disabled={isCameraActive}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50/30 text-slate-700 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Capture snapshot of notebook via webcam"
                >
                  <Camera className="w-3 h-3 text-[#f39223]" />
                  <span>{isCameraActive ? `Snapping (${cameraCountdown}s)...` : 'Scan Notebook'}</span>
                </button>

                {/* Quick 1-Click Contextual Sample Helper */}
                <button
                  type="button"
                  onClick={() => handleAddPreset(bestPresetKey)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg ${colorMap.tagBg} hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow-2xs`}
                  title={`Quick attach realistic example (${SAMPLE_PRESETS[bestPresetKey].name})`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Example ({SAMPLE_PRESETS[bestPresetKey].label})</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Working Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 mt-2 border-t border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400">Attach Sample:</span>
              {Object.entries(SAMPLE_PRESETS).map(([k, p]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleAddPreset(k as keyof typeof SAMPLE_PRESETS)}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-[10px] text-slate-600 font-medium transition-colors cursor-pointer flex items-center gap-0.5 shadow-2xs"
                  title={`Attach ${p.name}`}
                >
                  <span>+ {p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State when readOnly and no attachments */}
      {readOnly && attachments.length === 0 && (
        <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5 text-slate-300" />
          <span>No candidate rough working or notebook sheet attached for this question</span>
        </div>
      )}

      {/* List of Attached Files */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {attachments.map((file) => {
            const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
            const isPdf = file.type?.includes('pdf') || file.name?.endsWith('.pdf');

            return (
              <div
                key={file.id}
                className="group p-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs flex items-center justify-between gap-2.5 transition-all"
              >
                {/* File Thumbnail or Icon */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {isImage && (file.previewUrl || file.url) ? (
                    <div
                      onClick={() => setPreviewAttachment(file)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer bg-slate-100 relative group/thumb"
                    >
                      <img
                        src={file.previewUrl || file.url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : isPdf ? (
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                      PDF
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      onClick={() => setPreviewAttachment(file)}
                      className="text-xs font-bold text-slate-800 truncate hover:text-purple-700 cursor-pointer"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Attached
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(file)}
                    className="p-1 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                    title="Preview file"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(file.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate text-white">{previewAttachment.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {previewAttachment.size} • Uploaded at {previewAttachment.uploadedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewAttachment.url && (
                  <a
                    href={previewAttachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1 px-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Preview */}
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-100/70 min-h-[250px]">
              {previewAttachment.url?.startsWith('data:image') ||
              previewAttachment.url?.includes('unsplash.com') ||
              previewAttachment.previewUrl ? (
                <div className="space-y-2 text-center w-full">
                  <img
                    src={previewAttachment.previewUrl || previewAttachment.url}
                    alt={previewAttachment.name}
                    className="max-h-[55vh] mx-auto rounded-xl shadow-md border border-slate-200 object-contain bg-white"
                  />
                  <p className="text-[11px] text-slate-500 font-mono">
                    Student rough working / handwritten calculation sheet
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{previewAttachment.name}</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Portable Document Format ({previewAttachment.size})
                    </p>
                  </div>
                  {previewAttachment.url && (
                    <a
                      href={previewAttachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Download / Open PDF</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
