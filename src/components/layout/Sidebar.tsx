import React, { useState } from 'react';
import {
  Video,
  ClipboardCheck,
  PlusCircle,
  Menu,
  X,
  Library,
  LayoutDashboard,
  CalendarPlus,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import type { ActiveNavTab } from '../../types';

interface NavGroup {
  category?: string;
  items: {
    id: ActiveNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    portalMode,
    setPortalMode,
    activeTab,
    setActiveTab,
    liveAssessments,
    parentAccount,
    selectedChild,
    setSelectedChildId,
  } = useExam();
  const [mobileOpen, setMobileOpen] = useState(false);
  const teacher = portalMode === 'teacher';

  const navGroups: NavGroup[] = teacher
    ? [
        {
          items: [
            {
              id: 'online-classes',
              label: 'Dashboard',
              icon: <LayoutDashboard size={17} />,
            },
          ],
        },
        {
          category: 'CLASSES & SESSIONS',
          items: [
            {
              id: 'online-classes',
              label: 'Online Classes',
              icon: <Video size={17} />,
            },
            {
              id: 'create-online-class',
              label: 'Schedule Class',
              icon: <CalendarPlus size={17} />,
            },
          ],
        },
        {
          category: 'ASSESSMENT MANAGEMENT',
          items: [
            {
              id: 'online-class-assessments',
              label: 'Class Assessments',
              icon: <ClipboardCheck size={17} />,
              badge: liveAssessments.length,
            },
            {
              id: 'question-pool',
              label: 'Question Pool',
              icon: <Library size={17} />,
            },
            {
              id: 'create-class-assessment',
              label: 'Create Assessment',
              icon: <PlusCircle size={17} />,
            },
          ],
        },
      ]
    : [
        {
          items: [
            {
              id: 'student-online-classes',
              label: 'Dashboard',
              icon: <LayoutDashboard size={17} />,
            },
          ],
        },
        {
          category: 'LEARNING PORTAL',
          items: [
            {
              id: 'student-online-classes',
              label: 'Online Classes',
              icon: <Video size={17} />,
            },
          ],
        },
      ];

  const isItemActive = (id: ActiveNavTab, label: string) => {
    if (label === 'Dashboard') {
      return activeTab === id;
    }
    if (id === 'online-classes') {
      return activeTab === 'online-classes';
    }
    return activeTab === id;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-3 left-3 z-40 rounded-xl bg-white p-2.5 text-slate-800 border border-slate-200 shadow-sm"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          aria-label="Dismiss navigation"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-30 md:static w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200/90 h-screen overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        } md:translate-x-0 md:visible`}
      >
        {/* Brand Header */}
        <div className="p-4 pt-6 md:pt-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Orange rounded square badge like CampusEnli logo */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap size={20} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight truncate">
                  CampusEnlight
                </span>
                <Sparkles size={13} className="text-orange-500 shrink-0" />
              </div>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                Online Classroom & Exam
              </p>
            </div>
          </div>
        </div>

        {/* Portal Switcher (Teacher vs Student) */}
        <div className="mx-3.5 my-3 p-1 rounded-xl bg-slate-100/90 grid grid-cols-2 gap-1 border border-slate-200/60">
          {(['teacher', 'parent_student'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPortalMode(mode)}
              className={`py-1.5 rounded-lg text-xs transition-all ${
                portalMode === mode
                  ? 'bg-white text-orange-600 font-bold shadow-xs border border-orange-100/50'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {mode === 'teacher' ? 'Teacher' : 'Student'}
            </button>
          ))}
        </div>

        {/* Child Selector for Student Portal */}
        {!teacher && (
          <div className="px-3.5 pb-2">
            <label
              htmlFor="active-student"
              className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
            >
              Active Student
            </label>
            <select
              id="active-student"
              value={selectedChild.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {parentAccount.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} ({child.class})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Menu Navigation */}
        <nav aria-label="Main navigation" className="flex-1 px-3 py-1 space-y-3">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-0.5">
              {group.category && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1">
                  {group.category}
                </div>
              )}
              {group.items.map((item, iIdx) => {
                const active = isItemActive(item.id, item.label);
                return (
                  <button
                    key={`${item.id}-${iIdx}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] transition-all group ${
                      active
                        ? 'bg-[#FFF5EB] border border-[#FED7AA]/70 text-orange-600 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 font-medium'
                    }`}
                  >
                    <span
                      className={`shrink-0 transition-colors ${
                        active
                          ? 'text-orange-500'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom User Card Matching SuperAdmin Style */}
        <div className="p-3 m-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {teacher ? 'SJ' : selectedChild.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 text-xs truncate">
              {teacher ? 'Prof. Sarah Jenkins' : selectedChild.name}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 truncate">
              {teacher ? 'SuperAdmin · Teacher' : `${selectedChild.class} · Student`}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
