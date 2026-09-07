import React, { useState, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  PhoneOff,
  Users,
  MessageSquare,
  Sparkles,
  Radio,
  Shield,
  FileText,
  Hand,
  Settings,
  MoreVertical,
  Volume2,
  CheckCircle2,
  Send,
  HelpCircle,
  Clock,
  BookOpen,
  ArrowLeft,
  Smile,
  Layout,
  Maximize2,
  Play,
  RotateCcw,
  Zap,
  Award,
  ExternalLink,
  Lock,
  UserCheck,
  Check,
  Plus,
  Eye,
} from 'lucide-react';
import { LiveAssessmentStudentModal } from '../components/modals/LiveAssessmentStudentModal';
import { LiveAssessmentTeacherReviewModal } from '../components/modals/LiveAssessmentTeacherReviewModal';
import { LiveAssessmentCreatorModal } from '../components/modals/LiveAssessmentCreatorModal';

export const LiveClassroomView: React.FC = () => {
  const {
    activeLiveClass,
    onlineClasses,
    setActiveTab,
    endLiveClass,
    addToast,
    activeLiveAssessment,
    liveAssessments,
    launchSavedAssessmentInClass,
    launchLiveAssessment,
    setShowStudentAssessmentModal,
    setShowTeacherAssessmentReviewModal,
    setShowAssessmentCreatorModal,
  } = useExam();

  const currentClass = activeLiveClass || onlineClasses[0];

  // Classroom Simulation Role Toggle: Teacher Mode vs Student Mode
  const [classroomRole, setClassroomRole] = useState<'teacher' | 'student'>('teacher');

  // Classroom Live Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<
    'chat' | 'participants' | 'materials' | 'whiteboard' | 'assessment'
  >('chat');
  const [whiteboardColor, setWhiteboardColor] = useState('#2563eb');
  const [handRaised, setHandRaised] = useState(false);

  // Chat Feed State
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      avatar: string;
      role: 'teacher' | 'student';
      text: string;
      time: string;
      isAssessmentBroadcast?: boolean;
      assessmentId?: string;
    }>
  >([
    {
      id: 'msg-1',
      sender: 'Prof. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'teacher',
      text: 'Good morning everyone! Please open slide deck page 4 on differential rate of change.',
      time: '11:02 AM',
    },
    {
      id: 'msg-2',
      sender: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      role: 'student',
      text: "Good morning ma'am, the slide is visible clearly!",
      time: '11:03 AM',
    },
    {
      id: 'msg-3',
      sender: 'Diya Sharma',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      role: 'student',
      text: "Can we also review question 5 from yesterday's homework?",
      time: '11:05 AM',
    },
    {
      id: 'msg-ass-broadcast',
      sender: 'Prof. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'teacher',
      text: '⚡ Live In-Class Assessment is now launched! Please click below to answer the MCQ & Match-the-Following spot quiz.',
      time: '11:15 AM',
      isAssessmentBroadcast: true,
      assessmentId: 'live-ass-1',
    },
  ]);

  const [messageInput, setMessageInput] = useState('');

  // Active Participants in Live Class
  const [participants, setParticipants] = useState<
    Array<{ id: string; name: string; avatar: string; role: string; micOn: boolean; camOn: boolean; handRaised: boolean }>
  >([
    {
      id: 'p-0',
      name: currentClass.instructorName || 'Prof. Sarah Jenkins',
      avatar:
        currentClass.instructorAvatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      role: 'Teacher (Host)',
      micOn: true,
      camOn: true,
      handRaised: false,
    },
    {
      id: 'p-1',
      name: 'Aarav Sharma (1001)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      micOn: false,
      camOn: true,
      handRaised: false,
    },
    {
      id: 'p-2',
      name: 'Diya Sharma (804)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      micOn: true,
      camOn: true,
      handRaised: true,
    },
    {
      id: 'p-3',
      name: 'Kabir Sharma (612)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      micOn: false,
      camOn: false,
      handRaised: false,
    },
    {
      id: 'p-4',
      name: 'Rohan Patel (1004)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      micOn: false,
      camOn: true,
      handRaised: false,
    },
    {
      id: 'p-5',
      name: 'Ananya Verma (1005)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: 'Student',
      micOn: false,
      camOn: true,
      handRaised: false,
    },
  ]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const isTeacher = classroomRole === 'teacher';
    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: isTeacher ? (currentClass.instructorName || 'Prof. Sarah Jenkins') : 'Aarav Sharma',
      avatar: isTeacher
        ? (currentClass.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80')
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      role: (isTeacher ? 'teacher' : 'student') as 'teacher' | 'student',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput('');
  };

  const toggleStudentMic = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, micOn: !p.micOn } : p))
    );
    addToast('Audio Permission Changed', 'Participant audio state toggled.', 'info');
  };

  const totalSubmissions = activeLiveAssessment?.submissions?.length || 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Live Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('online-classes')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to Class List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                LIVE
              </span>
              <h1 className="text-sm font-black text-white tracking-tight">{currentClass.title}</h1>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                ({currentClass.subject} • {currentClass.class} - {currentClass.section})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Instructor: <b className="text-slate-200">{currentClass.instructorName}</b> • {participants.length} Active Learners
            </p>
          </div>
        </div>

        {/* Top Header Actions: Assessment Quick Dispatch & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Active Live Assessment Alert Badge */}
          {activeLiveAssessment && (
            <button
              onClick={() => {
                if (classroomRole === 'teacher') {
                  setShowTeacherAssessmentReviewModal(true);
                } else {
                  setShowStudentAssessmentModal(true);
                }
              }}
              className="px-3 py-1 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {classroomRole === 'teacher'
                  ? `Assessment: ${totalSubmissions} Submissions`
                  : 'Live Quiz Active! Click to Answer'}
              </span>
            </button>
          )}

          {/* Teacher Launch Assessment Button */}
          <button
            onClick={() => setShowAssessmentCreatorModal(true)}
            className="px-3 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">⚡ Send Live Assessment</span>
            <span className="sm:hidden">Assessment</span>
          </button>

          {/* Role Perspective Simulator Pill */}
          <div className="bg-slate-800 p-0.5 rounded-xl border border-slate-700 flex items-center text-xs">
            <button
              onClick={() => setClassroomRole('teacher')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                classroomRole === 'teacher' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Teacher (Host)
            </button>
            <button
              onClick={() => setClassroomRole('student')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                classroomRole === 'student' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student (Aarav)
            </button>
          </div>

          <button
            onClick={() => endLiveClass(currentClass.id)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Lecture</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Screen Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stage Left: Main Video Stream & Interactive Whiteboard Area */}
        <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
          {/* Main Stage Video / Whiteboard Screen */}
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl flex items-center justify-center min-h-[360px]">
            {activeSidePanel === 'whiteboard' ? (
              /* Collaborative Digital Math Whiteboard Canvas */
              <div className="w-full h-full bg-slate-950 p-6 flex flex-col justify-between relative">
                {/* Whiteboard Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Live Mathematical Canvas • Stylus Broadcast Active
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setWhiteboardColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          whiteboardColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      onClick={() => addToast('Canvas Cleared', 'Whiteboard cleared for next derivation.', 'info')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg ml-2 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Simulated Math Derivations on Board */}
                <div className="flex-1 flex flex-col items-center justify-center font-mono space-y-3 select-none">
                  <p className="text-xl sm:text-2xl font-bold tracking-wide" style={{ color: whiteboardColor }}>
                    f'(x) = lim (h → 0) [ f(x + h) - f(x) ] / h
                  </p>
                  <p className="text-sm text-slate-400">
                    d/dx [ sin(3x) ] = cos(3x) · d/dx[3x] = 3 · cos(3x)
                  </p>
                  <div className="p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-purple-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Real-time vector pen latency: 12ms (Synchronized across all enrolled learners)</span>
                  </div>
                </div>

                {/* Bottom Canvas Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Grid Resolution: 3840 x 2160 UHD</span>
                  <span>Presenter: Prof. Sarah Jenkins</span>
                </div>
              </div>
            ) : (
              /* Instructor Primary Video Feed */
              <div className="w-full h-full relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&auto=format&fit=crop&q=80"
                  alt="Teacher Feed"
                  className="w-full h-full object-cover"
                />

                {/* Live Stream Overlay Elements */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Prof. Sarah Jenkins (Instructor)</span>
                  </div>
                  {isRecording && (
                    <div className="bg-red-600/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      REC
                    </div>
                  )}
                </div>

                {/* Assessment Broadcast Floating Pill Over Stream */}
                {activeLiveAssessment && (
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-amber-500/40 shadow-xl max-w-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-amber-400" />
                        Live Spot Quiz Active
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">180s Timer</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-semibold line-clamp-1">
                      {activeLiveAssessment.title}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      {classroomRole === 'teacher' ? (
                        <button
                          onClick={() => setShowTeacherAssessmentReviewModal(true)}
                          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Review ({totalSubmissions} Submissions)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowStudentAssessmentModal(true)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1 animate-pulse"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Click to Answer Assessment</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Slide / Topic Banner */}
                <div className="absolute bottom-4 left-4 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Slide 4: Advanced Chain Rule & Derivatives</p>
                    <p className="text-[10px] text-slate-400">EduStream Native Ultra-HD • 1080p 60fps</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Video Thumbnail Strip (Bottom) */}
          <div className="h-28 bg-slate-900/80 rounded-2xl border border-slate-800 p-2 flex items-center gap-2.5 overflow-x-auto shrink-0">
            {participants.slice(1).map((p) => (
              <div
                key={p.id}
                className="w-40 h-full rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden shrink-0 group flex items-center justify-center"
              >
                {p.camOn ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <CameraOff className="w-5 h-5 mb-1" />
                    <span className="text-[9px]">Camera Off</span>
                  </div>
                )}

                {/* Student Name & Status Badges */}
                <div className="absolute bottom-1.5 inset-x-1.5 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center justify-between text-[10px] text-white">
                  <span className="truncate font-bold max-w-[85px]">{p.name.split(' ')[0]}</span>
                  <div className="flex items-center gap-1">
                    {p.handRaised && <Hand className="w-3 h-3 text-amber-400 animate-bounce" />}
                    {p.micOn ? (
                      <Mic className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Right: Interactive Sidebar (Chat Feed, Assessment Hub, Participants, Whiteboard) */}
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          {/* Side Panel Tabs Header */}
          <div className="h-12 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveSidePanel('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeSidePanel === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>

              <button
                onClick={() => setActiveSidePanel('participants')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeSidePanel === 'participants'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Learners ({participants.length})
              </button>

              <button
                onClick={() => setActiveSidePanel('materials')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeSidePanel === 'materials'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Files
              </button>

              <button
                onClick={() => setActiveSidePanel('assessment')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeSidePanel === 'assessment'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                Quizzes
              </button>
            </div>

            <button
              onClick={() => setShowAssessmentCreatorModal(true)}
              className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1"
              title="Launch In-Class Quiz"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Quiz</span>
            </button>
          </div>

          {/* Panel Content Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeSidePanel === 'chat' && (
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={msg.avatar}
                          alt={msg.sender}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span
                          className={`font-bold ${
                            msg.role === 'teacher' ? 'text-blue-400' : 'text-slate-300'
                          }`}
                        >
                          {msg.sender}
                        </span>
                      </div>
                      <span className="text-slate-500">{msg.time}</span>
                    </div>

                    {msg.isAssessmentBroadcast ? (
                      /* Live Assessment Interactive Chat Card */
                      <div className="p-3.5 rounded-2xl bg-linear-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-blue-500/40 shadow-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/40">
                            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                            Live In-Class Assessment
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 font-bold">10 Marks • 3 Qs</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-white">
                            {activeLiveAssessment?.title || 'Spot Check: Differentiation Rules & Applications'}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Answer 1 MCQ, 1 Interactive Match the Following & 1 Concept Question now!
                          </p>
                        </div>

                        <div className="pt-1 flex flex-col gap-1.5">
                          {classroomRole === 'teacher' ? (
                            <button
                              onClick={() => setShowTeacherAssessmentReviewModal(true)}
                              className="w-full py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>Review Student Answers ({totalSubmissions} Submissions)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setShowStudentAssessmentModal(true)}
                              className="w-full py-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all animate-pulse"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>⚡ Open & Answer Live Assessment</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (classroomRole === 'teacher') {
                                setShowStudentAssessmentModal(true);
                              } else {
                                setShowTeacherAssessmentReviewModal(true);
                              }
                            }}
                            className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-200 text-center font-medium"
                          >
                            {classroomRole === 'teacher'
                              ? 'Preview Student Answering Experience →'
                              : 'View Live Leaderboard / Review →'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`p-2.5 rounded-xl text-xs ${
                          msg.role === 'teacher'
                            ? 'bg-blue-950/60 border border-blue-800/60 text-blue-100'
                            : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSidePanel === 'participants' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
                  <span>Enrolled Attendees</span>
                  <span className="text-blue-400">{participants.length} Active</span>
                </div>
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-600"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.handRaised && <Hand className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                      <button
                        onClick={() => toggleStudentMic(p.id)}
                        className={`p-1.5 rounded-lg ${
                          p.micOn ? 'bg-emerald-600/30 text-emerald-400' : 'bg-red-600/30 text-red-400'
                        }`}
                      >
                        {p.micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSidePanel === 'materials' && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Class Study Materials</p>
                {currentClass.materials.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1"
                  >
                    <p className="text-xs font-bold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-slate-400">
                      {m.type.toUpperCase()} • {m.fileSize}
                    </p>
                    <button
                      onClick={() => addToast('Downloading File', `Saved ${m.title}`, 'success')}
                      className="w-full mt-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center"
                    >
                      Download Material
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Assessment Side Panel Tab */}
            {activeSidePanel === 'assessment' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    In-Class Quizzes
                  </span>
                  <button
                    onClick={() => setShowAssessmentCreatorModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Select/Customize</span>
                  </button>
                </div>

                {/* Active Live Assessment Monitor if active */}
                {activeLiveAssessment && (
                  <div className="p-3.5 rounded-2xl bg-linear-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-amber-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">
                        ● Live Broadcast
                      </span>
                      <span className="text-[10px] text-amber-300 font-bold">
                        {activeLiveAssessment.totalMarks} Marks • {activeLiveAssessment.questions.length} Qs
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-white">{activeLiveAssessment.title}</h4>

                    <div className="pt-1 space-y-1.5">
                      {classroomRole === 'teacher' ? (
                        <>
                          <button
                            onClick={() => setShowTeacherAssessmentReviewModal(true)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            <span>View Live Submissions ({activeLiveAssessment.submissions.length})</span>
                          </button>
                          <button
                            onClick={() => setShowStudentAssessmentModal(true)}
                            className="w-full py-1 text-[10px] text-slate-400 hover:text-slate-200 text-center font-medium"
                          >
                            Preview Student Test Solving →
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowStudentAssessmentModal(true)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all animate-pulse"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Answer Spot Quiz Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Saved Assessments Library in Live Class */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Saved In-Class Assessments Library ({liveAssessments.length})
                  </span>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {liveAssessments.map((ass) => {
                      const isCurrentActive = activeLiveAssessment?.id === ass.id;
                      return (
                        <div
                          key={ass.id}
                          className={`p-3 rounded-xl border space-y-2 text-xs transition-all ${
                            isCurrentActive
                              ? 'bg-slate-800/90 border-blue-500/60'
                              : 'bg-slate-800/40 border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-400">{ass.subject}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {ass.durationSeconds > 0 ? `${Math.floor(ass.durationSeconds / 60)}m` : 'Untimed'} • {ass.totalMarks}M
                            </span>
                          </div>

                          <p className="text-white font-bold text-[11px] line-clamp-1">{ass.title}</p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                launchSavedAssessmentInClass(ass.id, currentClass.id);
                                addToast(
                                  'Assessment Broadcasted',
                                  `"${ass.title}" is now shared in live classroom!`,
                                  'success'
                                );
                              }}
                              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isCurrentActive ? 'Re-broadcast' : 'Share to Class'}</span>
                            </button>

                            <button
                              onClick={() => {
                                launchSavedAssessmentInClass(ass.id, currentClass.id);
                                setShowStudentAssessmentModal(true);
                              }}
                              className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-medium"
                              title="Test Student Answering"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Chat Message Input Box & Send Assessment Shortcut */}
          {activeSidePanel === 'chat' && (
            <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={
                    classroomRole === 'teacher'
                      ? 'Type message as Teacher...'
                      : 'Type message as Student...'
                  }
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {classroomRole === 'teacher' && (
                <button
                  onClick={() => setShowAssessmentCreatorModal(true)}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Send Assessment Link to Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Classroom Control Bar */}
      <div className="h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between shrink-0">
        {/* Left Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200">Scheduled: {currentClass.durationMinutes} mins</span>
        </div>

        {/* Center Main Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsMicOn(!isMicOn);
              addToast(isMicOn ? 'Microphone Muted' : 'Microphone Unmuted', '', 'info');
            }}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              isMicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-red-600 text-white shadow-red-600/30'
            }`}
            title="Toggle Microphone"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setIsCameraOn(!isCameraOn);
              addToast(isCameraOn ? 'Camera Turned Off' : 'Camera Active', '', 'info');
            }}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              isCameraOn
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-red-600 text-white shadow-red-600/30'
            }`}
            title="Toggle Camera"
          >
            {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => {
              setIsScreenSharing(!isScreenSharing);
              addToast(
                isScreenSharing ? 'Screen Share Stopped' : 'Screen Share Active',
                '',
                'info'
              );
            }}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-blue-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Share Screen"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setHandRaised(!handRaised);
              addToast(handRaised ? 'Hand Lowered' : 'Hand Raised', '', 'info');
            }}
            className={`p-3 rounded-2xl transition-all shadow-md ${
              handRaised
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTeacherAssessmentReviewModal(true)}
            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Assessments ({totalSubmissions})</span>
          </button>

          <button
            onClick={() => setActiveSidePanel(activeSidePanel === 'whiteboard' ? 'chat' : 'whiteboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeSidePanel === 'whiteboard'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Whiteboard
          </button>
        </div>
      </div>

      {/* In-Class Modals */}
      <LiveAssessmentStudentModal />
      <LiveAssessmentTeacherReviewModal />
      <LiveAssessmentCreatorModal />
    </div>
  );
};
