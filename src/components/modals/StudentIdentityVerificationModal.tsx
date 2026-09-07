import React, { useState, useEffect, useRef } from 'react';
import { useExam } from '../../context/ExamContext';
import { mockStudentSmartCards } from '../../data/mockData';
import { StudentVerificationProfile, StudentSmartCard } from '../../types';
import {
  X,
  CreditCard,
  Camera,
  CheckCircle2,
  Scan,
  ShieldCheck,
  Smartphone,
  Radio,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  Zap,
  Lock,
  Check,
} from 'lucide-react';

export const StudentIdentityVerificationModal: React.FC = () => {
  const {
    verifyingAssessment,
    showStudentVerificationModal,
    setShowStudentVerificationModal,
    completeStudentVerification,
    addToast,
  } = useExam();

  const [activeMethod, setActiveMethod] = useState<'nfc' | 'face'>('nfc');
  const [isScanningNfc, setIsScanningNfc] = useState<boolean>(true);
  const [isScanningFace, setIsScanningFace] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [verifiedCandidate, setVerifiedCandidate] = useState<StudentVerificationProfile | null>(null);
  const [faceScanProgress, setFaceScanProgress] = useState<number>(0);
  const [faceScanStep, setFaceScanStep] = useState<string>('Align face inside the biometric frame');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play synthetic verification beep chime
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user interaction
    }
  };

  // Start / stop camera stream when in face recognition mode
  useEffect(() => {
    if (!showStudentVerificationModal || activeMethod !== 'face') {
      stopCamera();
      return;
    }

    let isMounted = true;
    const startCamera = async () => {
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          });
          if (isMounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
          } else {
            stream.getTracks().forEach((track) => track.stop());
          }
        } else {
          setCameraError('Camera API not accessible in this browser. Simulated camera feed enabled.');
        }
      } catch (err: unknown) {
        console.warn('Camera permission denied or unavailable:', err);
        setCameraError('Webcam unavailable. Interactive biometric simulator active.');
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [showStudentVerificationModal, activeMethod]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!showStudentVerificationModal || !verifyingAssessment) return null;

  // Handle NFC Card Tap (either simulated or Web NFC)
  const handleCardTap = (card: StudentSmartCard) => {
    playSuccessChime();
    const profile: StudentVerificationProfile = {
      id: card.studentId,
      name: card.name,
      rollNo: card.rollNo,
      admissionNo: card.admissionNo,
      class: card.classGrade,
      section: 'Sec A',
      avatar: card.avatar,
      cardUid: card.cardUid,
      verifiedVia: 'nfc',
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setVerifiedCandidate(profile);
    addToast('NFC Card Authenticated', `Card UID [${card.cardUid}] verified for ${card.name}.`, 'success');
  };

  // Trigger Biometric Facial Scan simulation
  const handleTriggerFaceScan = (studentMatch?: StudentSmartCard) => {
    if (isScanningFace) return;
    const targetStudent = studentMatch || mockStudentSmartCards[0];
    setIsScanningFace(true);
    setFaceScanProgress(15);
    setFaceScanStep('Detecting face in frame...');

    setTimeout(() => {
      setFaceScanProgress(45);
      setFaceScanStep('Analyzing facial geometry & liveness...');
    }, 600);

    setTimeout(() => {
      setFaceScanProgress(80);
      setFaceScanStep('Cross-referencing School SIS biometric registry...');
    }, 1200);

    setTimeout(() => {
      setFaceScanProgress(100);
      setFaceScanStep('Biometric Match Confirmed (99.4% confidence)');
      setIsScanningFace(false);
      playSuccessChime();

      const profile: StudentVerificationProfile = {
        id: targetStudent.studentId,
        name: targetStudent.name,
        rollNo: targetStudent.rollNo,
        admissionNo: targetStudent.admissionNo,
        class: targetStudent.classGrade,
        section: 'Sec A',
        avatar: targetStudent.avatar,
        cardUid: targetStudent.cardUid,
        verifiedVia: verifiedCandidate?.verifiedVia === 'nfc' ? 'both' : 'face',
        confidenceScore: 99.4,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setVerifiedCandidate(profile);
      addToast('Facial Recognition Match', `Biometrics confirmed for ${targetStudent.name} (99.4% confidence).`, 'success');
    }, 1900);
  };

  const handleProceedToAssessment = () => {
    if (!verifiedCandidate) return;
    stopCamera();
    completeStudentVerification(verifiedCandidate);
  };

  const handleClose = () => {
    stopCamera();
    setShowStudentVerificationModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Student Verification Gateway
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Smart Authentication
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tap your NFC/RFID student card or scan your face to authenticate your exam session
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Assessment Header Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#fff4e6] text-[#c26d15] border border-[#fcd8b3]">
                  {verifyingAssessment.subject}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {verifyingAssessment.topic || 'Live Assessment'}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">
                {verifyingAssessment.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                {verifyingAssessment.questions.length} Qs
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                {verifyingAssessment.totalMarks} Marks
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {verifyingAssessment.durationSeconds > 0
                  ? `${Math.floor(verifyingAssessment.durationSeconds / 60)}m`
                  : 'Untimed'}
              </span>
            </div>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveMethod('nfc')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === 'nfc'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${activeMethod === 'nfc' ? 'text-amber-500' : 'text-slate-500'}`} />
              <span>Option 1: Tap NFC / RFID Card</span>
            </button>

            <button
              onClick={() => setActiveMethod('face')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMethod === 'face'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className={`w-4 h-4 ${activeMethod === 'face' ? 'text-amber-500' : 'text-slate-500'}`} />
              <span>Option 2: Facial Recognition Scan</span>
            </button>
          </div>

          {/* Verification Method Views */}
          {activeMethod === 'nfc' ? (
            /* ================= MODE 1: NFC / RFID SMART CARD ================= */
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
                {/* Contactless Radio Ripple Waves Effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-64 h-64 rounded-full border-2 border-amber-400 animate-ping" />
                  <div className="w-48 h-48 rounded-full border border-orange-400 animate-pulse" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/40 relative">
                    <Radio className="w-8 h-8 text-white animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-white">
                      Hold Student RFID / NFC Smart Card to Reader
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Ready to detect contactless card. Tap against phone back, NFC reader, or click a registered test card below.
                    </p>
                  </div>

                  {/* Simulated Smart Card Graphic */}
                  <div className="w-full max-w-sm bg-gradient-to-tr from-slate-800/90 to-slate-700/80 border border-slate-600/70 rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-8 rounded-lg bg-amber-400/30 border border-amber-400/50 flex items-center justify-center text-amber-300 font-mono text-[9px] font-bold">
                        CHIP
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                          School ID Card
                        </span>
                        <span className="text-xs font-black text-white">
                          {verifiedCandidate ? verifiedCandidate.name : 'Tap Card to Identify'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-amber-400 font-bold">
                      {verifiedCandidate?.cardUid || 'UID: --:--:--:--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick-Tap Registered Student Cards for Instant Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Registered Student Smartcards (Click to Tap)
                  </span>
                  <span className="text-[11px] text-slate-400">Class 10 Smartcard Registry</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mockStudentSmartCards.map((card) => {
                    const isSelected = verifiedCandidate?.cardUid === card.cardUid;
                    return (
                      <button
                        key={card.cardUid}
                        onClick={() => handleCardTap(card)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <img
                          src={card.avatar}
                          alt={card.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-extrabold text-slate-900 truncate">
                              {card.name}
                            </h5>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Roll #{card.rollNo} • {card.classGrade}
                          </p>
                          <span className="text-[10px] font-mono text-amber-600 font-bold">
                            UID: {card.cardUid}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ================= MODE 2: FACIAL RECOGNITION SCAN ================= */
            <div className="space-y-4">
              {/* Biometric Viewfinder Container */}
              <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video sm:aspect-[16/10] flex items-center justify-center border-2 border-slate-800 shadow-xl">
                {/* Live Webcam Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                />

                {/* Simulated Camera Feed if webcam denied/unavailable */}
                {!cameraActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-slate-800/80 border-2 border-slate-700 flex items-center justify-center relative">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <div className="absolute inset-0 rounded-full border border-amber-400/50 animate-ping" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">
                        Live Biometric Camera Viewport
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Position face inside targeting frame. Works with connected webcam or simulated AI recognition.
                      </p>
                    </div>
                  </div>
                )}

                {/* Biometric Targeting HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                  {/* Holographic Face Oval */}
                  <div
                    className={`w-48 h-60 sm:w-56 sm:h-72 rounded-[45%] border-2 transition-all duration-300 relative flex items-center justify-center ${
                      isScanningFace
                        ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                        : verifiedCandidate?.verifiedVia === 'face' || verifiedCandidate?.verifiedVia === 'both'
                        ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)]'
                        : 'border-slate-400/60 border-dashed'
                    }`}
                  >
                    {/* Corner Reticle Brackets */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

                    {/* Laser Scan Line Sweep */}
                    {isScanningFace && (
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce" />
                    )}

                    {/* Biometric Landmark Tracking Points */}
                    {isScanningFace && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-[35%] left-[35%] animate-ping" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-[35%] right-[35%] animate-ping" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-[55%] animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-[70%] animate-ping" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status HUD Header on Camera */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono font-bold text-white bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isScanningFace ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{faceScanStep}</span>
                  </div>
                  <span>{faceScanProgress > 0 ? `${faceScanProgress}%` : 'READY'}</span>
                </div>
              </div>

              {/* Face Match Trigger & Quick Simulators */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                    <Scan className="w-3.5 h-3.5 text-amber-500" />
                    Simulate Facial Recognition Match
                  </span>
                  <span className="text-[11px] text-slate-400">Select candidate to verify face</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {mockStudentSmartCards.slice(0, 3).map((student) => (
                    <button
                      key={student.studentId}
                      disabled={isScanningFace}
                      onClick={() => handleTriggerFaceScan(student)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white text-left flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 block truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Match Biometrics →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Verified Candidate Profile Card */}
          {verifiedCandidate ? (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Candidate Identity Confirmed
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {verifiedCandidate.verifiedAt}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={verifiedCandidate.avatar}
                  alt={verifiedCandidate.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                />

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-base font-black text-slate-900">
                    {verifiedCandidate.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-bold">
                    Admission No: {verifiedCandidate.admissionNo} • Roll No: {verifiedCandidate.rollNo}
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Class: {verifiedCandidate.class} ({verifiedCandidate.section})
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-white border border-emerald-200 text-emerald-800 shadow-xs flex items-center gap-1">
                      {verifiedCandidate.verifiedVia === 'nfc' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified via RFID/NFC Card ({verifiedCandidate.cardUid})</span>
                        </>
                      ) : verifiedCandidate.verifiedVia === 'face' ? (
                        <>
                          <Camera className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified via Facial Recognition Biometrics</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dual-Factor Verified (NFC & Face)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-amber-950">
                  Assessment Locked
                </span>
                <p className="text-amber-800 text-[11px]">
                  Please tap your student RFID card or complete face scan above to unlock questions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            disabled={!verifiedCandidate}
            onClick={handleProceedToAssessment}
            className={`py-2.5 px-6 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all ${
              verifiedCandidate
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to In-Class Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
