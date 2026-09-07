import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  Zap,
  Plus,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { LiveInClassAssessment } from '../../types';

export const LiveAssessmentCreatorModal: React.FC = () => {
  const { showAssessmentCreatorModal } = useExam();
  if (!showAssessmentCreatorModal) return null;
  return <LiveAssessmentCreatorModalContent />;
};

const LiveAssessmentCreatorModalContent: React.FC = () => {
  const {
    setShowAssessmentCreatorModal,
    launchLiveAssessment,
    liveAssessments,
    activeLiveClass,
    setActiveTab,
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl flex flex-col overflow-hidden text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[var(--border-color)] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Dispatch Live In-Class Assessment
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Send interactive spot quizzes directly into classroom session
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAssessmentCreatorModal(false)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-4 max-h-[70vh]">
          {/* Assessment Template Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
                Select Saved Assessment from Library
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAssessmentCreatorModal(false);
                  setActiveTab('create-class-assessment');
                }}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New in Builder</span>
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
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              {liveAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.subject} • {a.questions.length} Qs • {a.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          {/* Assessment Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
              Assessment Broadcast Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>

          {/* Quick Duration Limit Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
              Timer Duration Limit
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    durationSec === t.sec
                      ? 'bg-[var(--primary-light)]/40 border-[var(--primary)] ring-2 ring-[var(--primary)]/20 text-[var(--text-primary)] font-bold'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]/50'
                  }`}
                >
                  <p className="text-xs font-bold">{t.label}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Assessment Content Preview */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
            <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              Included Question Breakdown ({selectedTemplate?.questions.length || 0} Questions • {selectedTemplate?.totalMarks || 0} Marks)
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedTemplate?.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)] font-bold">Q{idx + 1}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                        {q.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[var(--text-primary)] font-medium truncate">{q.prompt}</p>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-card)] px-2 py-1 rounded-lg border border-[var(--border-color)] shrink-0">
                    {q.marks} Marks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowAssessmentCreatorModal(false)}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 text-sm font-semibold shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Assessment Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
