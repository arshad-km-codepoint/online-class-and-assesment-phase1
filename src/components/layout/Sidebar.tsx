import React, { useState } from 'react';
import { Video, ClipboardCheck, Plus, GraduationCap, Menu, X, Library } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import type { ActiveNavTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { portalMode, setPortalMode, activeTab, setActiveTab, liveAssessments, parentAccount, selectedChild, setSelectedChildId } = useExam();
  const [mobileOpen, setMobileOpen] = useState(false);
  const teacher = portalMode === 'teacher';
  const items: { id: ActiveNavTab; label: string; icon: React.ReactNode }[] = teacher ? [
    { id: 'online-classes', label: 'Online Classes', icon: <Video size={18} /> },
    { id: 'online-class-assessments', label: 'Class Assessments', icon: <ClipboardCheck size={18} /> },
    { id: 'question-pool', label: 'Question Pool', icon: <Library size={18} /> },
    { id: 'create-class-assessment', label: 'Create Assessment', icon: <Plus size={18} /> },
  ] : [{ id: 'student-online-classes', label: 'Online Classes', icon: <Video size={18} /> }];

  return (
    <>
    <button aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="app-sidebar" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden fixed top-3 left-3 z-40 rounded-lg bg-white p-2 text-slate-800 border border-slate-200">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
    {mobileOpen && <button aria-label="Dismiss navigation" onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 z-20 bg-slate-950/50" />}
    <aside id="app-sidebar" className={`fixed inset-y-0 left-0 z-30 md:static w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 h-screen overflow-y-auto transition-transform ${mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'} md:translate-x-0 md:visible`}>
      <div className="p-5 pt-16 md:pt-5 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600 text-white"><GraduationCap size={24} /></div>
        <div><p className="font-bold text-white">Online Learning</p><p className="text-xs text-slate-400">Classes & Assessments · Phase 1</p></div>
      </div>
      <div className="grid grid-cols-2 gap-1 m-3 p-1 rounded-lg bg-slate-800">
        {(['teacher', 'parent_student'] as const).map(mode => (
          <button key={mode} onClick={() => setPortalMode(mode)} className={`py-2 rounded-md text-xs font-semibold ${portalMode === mode ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {mode === 'teacher' ? 'Teacher' : 'Student'}
          </button>
        ))}
      </div>
      {!teacher && <div className="px-3 pb-3"><label htmlFor="active-student" className="block text-xs text-slate-400 mb-2">Active Student</label><select id="active-student" value={selectedChild.id} onChange={e => setSelectedChildId(e.target.value)} className="w-full p-2 bg-slate-800 rounded-lg text-xs">{parentAccount.children.map(child => <option key={child.id} value={child.id}>{child.name} ({child.class})</option>)}</select></div>}
      <nav aria-label="Main navigation" className="flex-1 px-3 py-2 space-y-1">
        {items.map(item => <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileOpen(false); }} aria-current={activeTab === item.id ? 'page' : undefined} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-semibold ${activeTab === item.id || (item.id === 'online-classes' && activeTab === 'create-online-class') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
          {item.icon}<span>{item.label}</span>{item.id === 'online-class-assessments' && <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-[10px]">{liveAssessments.length}</span>}
        </button>)}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs"><p className="font-semibold text-white">{teacher ? 'Prof. Sarah Jenkins' : selectedChild.name}</p><p className="mt-1 text-slate-400">{teacher ? 'Teacher Portal' : 'Student Portal'}</p></div>
    </aside>
    </>
  );
};
