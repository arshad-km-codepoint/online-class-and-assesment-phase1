import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  Zap,
  Plus,
  Clock,
  BookOpen,
  Send,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Play,
  RotateCcw,
} from 'lucide-react';
import { LiveInClassAssessment, LiveAssessmentQuestion } from '../../types';

export const LiveAssessmentCreatorModal: React.FC = () => {
  const { showAssessmentCreatorModal } = useExam();
  if (!showAssessmentCreatorModal) return null;
  return <LiveAssessmentCreatorModalContent />;
};

const LiveAssessmentCreatorModalContent: React.FC = () => {
  const {
    showAssessmentCreatorModal,
    setShowAssessmentCreatorModal,
    launchLiveAssessment,
    liveAssessments,
    activeLiveClass,
    setActiveTab,
    addToast,
  } = useExam();



  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(liveAssessments[0]?.id || '');
  const [customTitle, setCustomTitle] = useState<string>('Live Concept Check: Key Formulations');
  const [durationSec, setDurationSec] = useState<number>(180);

  const selectedTemplate = liveAssessments.find((a) => a.id === selectedTemplateId) || liveAssessments[0];

  const handleLaunch = () => {
    if (!selectedTemplate) return;

    const toLaunch: LiveInClassAssessment = {
      ...selectedTemplate,
      id: 'live-ass-' + Date.now().toString(36),
      classId: activeLiveClass?.id || 'cls-101',
      title: customTitle || selectedTemplate.title,
      durationSeconds: durationSec,
      status: 'active',
      launchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    launchLiveAssessment(toLaunch);
    setShowAssessmentCreatorModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
        {/* Top Header Bar */}
        <div className="p-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-md">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                Dispatch Live In-Class Assessment
              </h2>
              <p className="text-xs text-slate-300">
                Send interactive MCQ & Match-the-Following spot quiz directly into classroom chat
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAssessmentCreatorModal(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Assessment Template Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Select Saved Assessment from Library
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAssessmentCreatorModal(false);
                  setActiveTab('create-class-assessment');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New In Builder</span>
              </button>
            </div>

            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                const found = liveAssessments.find((a) => a.id === e.target.value);
                if (found) {
                  setCustomTitle(found.title);
                  setDurationSec(found.durationSeconds || 180);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {liveAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.subject} • {a.questions.length} Qs • {a.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Assessment Broadcast Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Quick Duration Limit Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Timer Duration Limit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 60, label: '1 Minute', desc: 'Lightning poll' },
                { sec: 120, label: '2 Minutes', desc: 'Quick check' },
                { sec: 180, label: '3 Minutes', desc: 'Standard quiz' },
                { sec: 300, label: '5 Minutes', desc: 'In-depth review' },
              ].map((t) => (
                <button
                  key={t.sec}
                  type="button"
                  onClick={() => setDurationSec(t.sec)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    durationSec === t.sec
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-[10px] text-slate-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Content Preview */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Included Question Breakdown ({selectedTemplate?.questions.length || 0} Questions • {selectedTemplate?.totalMarks || 0} Marks)
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedTemplate?.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">Q{idx + 1}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        q.type === 'mcq'
                          ? 'bg-blue-100 text-blue-800'
                          : q.type === 'mmcq'
                          ? 'bg-purple-100 text-purple-800'
                          : q.type === 'match_following'
                          ? 'bg-amber-100 text-amber-800'
                          : q.type === 'step_ordering'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {q.type === 'mcq'
                          ? 'MCQ Single Choice'
                          : q.type === 'mmcq'
                          ? 'MMCQ Multiple Choice'
                          : q.type === 'match_following'
                          ? 'Match the Following'
                          : q.type === 'step_ordering'
                          ? 'Sequence Ordering'
                          : 'Fill in Blanks'}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium truncate">{q.prompt}</p>
                  </div>
                  <span className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                    {q.marks} Marks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => setShowAssessmentCreatorModal(false)}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunch}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Assessment Link Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
