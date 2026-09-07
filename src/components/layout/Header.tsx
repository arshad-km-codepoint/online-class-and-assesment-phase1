import React from 'react';
import { Plus } from 'lucide-react';
import { useExam } from '../../context/ExamContext';

export const Header: React.FC = () => {
  const { activeTab, portalMode, setActiveTab } = useExam();
  const pages: Record<string, [string, string]> = {
    'online-classes': ['Online Classes', 'Schedule and manage your online classrooms'],
    'online-class-assessments': ['Online Class Assessments', 'Manage and share interactive class assessments'],
    'question-pool': ['Question Pool', 'Create and organize reusable assessment questions'],
    'create-class-assessment': ['Create Assessment', 'Build questions for your online classes'],
    'create-online-class': ['Schedule Online Class', 'Set up your class, meeting platform, and materials'],
    'student-online-classes': ['Online Classes', 'Join your classes and take part in class assessments'],
  };
  const [title, subtitle] = pages[activeTab] || pages['online-classes'];
  return <header className="min-h-16 bg-white border-b border-slate-200 pl-16 pr-3 md:px-6 py-3 flex items-center justify-between gap-4 shadow-xs">
    <div><h1 className="text-base font-bold text-slate-900">{title}</h1><p className="text-xs text-slate-500">{subtitle}</p></div>
    {portalMode === 'teacher' && <button aria-label="Schedule Class" onClick={() => setActiveTab('create-online-class')} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0"><Plus size={14} /><span className="hidden sm:inline">Schedule Class</span></button>}
  </header>;
};
