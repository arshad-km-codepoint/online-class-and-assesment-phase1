import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useExam } from '../../context/ExamContext';
import {
  X,
  Copy,
  Check,
  QrCode,
  Radio,
  Send,
  Download,
  Maximize2,
  Minimize2,
  Smartphone,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Clock,
  Award,
} from 'lucide-react';

export const ShareAssessmentModal: React.FC = () => {
  const {
    sharingAssessment,
    showShareAssessmentModal,
    closeShareAssessment,
    onlineClasses,
    activeLiveClass,
    openStudentVerification,
    launchSavedAssessmentInClass,
    addToast,
    setActiveTab,
  } = useExam();

  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [targetClassId, setTargetClassId] = useState<string>(
    activeLiveClass?.id || onlineClasses[0]?.id || 'cls-101'
  );

  const modalRef = useRef<HTMLDivElement>(null);

  // Synchronize target class if active live class is present
  useEffect(() => {
    if (activeLiveClass) {
      setTargetClassId(activeLiveClass.id);
    } else if (sharingAssessment?.classId) {
      setTargetClassId(sharingAssessment.classId);
    }
  }, [activeLiveClass, sharingAssessment]);

  // Construct sharing URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://portal.school.edu';
  const shareUrl = sharingAssessment
    ? `${currentOrigin}/assessments/live-gateway?assId=${sharingAssessment.id}&classId=${targetClassId}`
    : '';

  // Generate QR code whenever share URL or projector mode changes
  useEffect(() => {
    if (!shareUrl) return;

    QRCode.toDataURL(shareUrl, {
      width: isProjectorMode ? 420 : 260,
      margin: 2,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });
  }, [shareUrl, isProjectorMode]);

  if (!showShareAssessmentModal || !sharingAssessment) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      addToast(
        'Assessment Link Copied!',
        'Direct student access link copied to clipboard. Send to classroom chat or distribute to students.',
        'success'
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${sharingAssessment.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('QR Code Downloaded', 'High resolution QR code image saved.', 'info');
  };

  const handleSimulateScan = () => {
    closeShareAssessment();
    openStudentVerification(sharingAssessment);
  };

  const handleBroadcastToLiveClass = () => {
    launchSavedAssessmentInClass(sharingAssessment.id, targetClassId);
    closeShareAssessment();
    setActiveTab('live-classroom');
  };

  const selectedClassObj = onlineClasses.find((c) => c.id === targetClassId) || onlineClasses[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          isProjectorMode
            ? 'w-full max-w-4xl max-h-[95vh]'
            : 'w-full max-w-2xl max-h-[92vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Share Assessment to Live Class
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant QR & Link
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate student access code with NFC card & facial recognition verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProjectorMode(!isProjectorMode)}
              title={isProjectorMode ? 'Standard Window' : 'Projector / Fullscreen Mode'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {isProjectorMode ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Projector View</span>
                </>
              )}
            </button>

            <button
              onClick={closeShareAssessment}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Assessment Summary Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#fff4e6] text-[#c26d15] border border-[#fcd8b3]">
                  {sharingAssessment.subject}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {sharingAssessment.topic || 'In-Class Spot Assessment'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                {sharingAssessment.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                {sharingAssessment.questions.length} Qs
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {sharingAssessment.totalMarks} Marks
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {sharingAssessment.durationSeconds > 0
                  ? `${Math.floor(sharingAssessment.durationSeconds / 60)} mins`
                  : 'Untimed'}
              </span>
            </div>
          </div>

          {/* Main 2-Column: QR Code & Copy Link */}
          <div className={`grid gap-6 ${isProjectorMode ? 'grid-cols-1 md:grid-cols-2 items-center' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Left: Dynamic QR Code Card */}
            <div className="bg-gradient-to-b from-slate-50 to-amber-50/40 border border-amber-200/80 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live Code
                </span>
              </div>

              <div className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>Scan with Camera / Phone</span>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-200/90 shadow-md my-2 relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Assessment Access QR Code"
                    className={`rounded-xl object-contain transition-all ${
                      isProjectorMode ? 'w-64 h-64 sm:w-72 sm:h-72' : 'w-48 h-48 sm:w-52 sm:h-52'
                    }`}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Generating QR Code...
                  </div>
                )}

                {/* Center Badge Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white shadow-lg border-2 border-amber-400 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-5 h-5 fill-amber-500" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-medium max-w-xs mt-1">
                Students scan this QR code on classroom projector or personal screens to open the student verification gateway.
              </p>

              {/* QR Code Actions */}
              <div className="flex items-center gap-2 mt-4 w-full">
                <button
                  onClick={handleDownloadQr}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={() => setIsProjectorMode(!isProjectorMode)}
                  className="flex-1 py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isProjectorMode ? 'Normal View' : 'Enlarge for Projector'}</span>
                </button>
              </div>
            </div>

            {/* Right: Direct Link & Class Settings */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Target Class Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  Target Virtual Classroom
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  {onlineClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.title} ({cls.subject} • {cls.class} • {cls.status.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedClassObj ? `${selectedClassObj.enrolledStudentsCount} Students enrolled in ${selectedClassObj.class}` : 'Active session'}
                </p>
              </div>

              {/* Copy Assessment URL */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  Direct Student Access Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate select-all shadow-inner">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Share this URL in Zoom, Teams, Google Meet, or school chat.
                </p>
              </div>

              {/* Security & Verification Gate Notice */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-extrabold text-emerald-950">
                    Mandatory Student Verification Enforced
                  </span>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    When students open this link or scan the QR code, they must tap their NFC/RFID card or scan their face to authenticate before taking the test.
                  </p>
                </div>
              </div>

              {/* Quick Launch & Simulator Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2.5">
                <button
                  onClick={handleSimulateScan}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>Test Student QR Scan & Identification</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={closeShareAssessment}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleBroadcastToLiveClass}
              className="w-full sm:w-auto py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Broadcast to Live Classroom Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
