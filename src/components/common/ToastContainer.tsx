import React from 'react';
import { useExam } from '../../context/ExamContext';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useExam();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : t.type === 'warning'
              ? 'bg-amber-950 text-amber-100 border-amber-800'
              : t.type === 'danger'
              ? 'bg-red-950 text-red-100 border-red-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {t.type === 'danger' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold leading-tight">{t.title}</h4>
            <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{t.description}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
