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
        type="button"
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-3 left-3 z-40 rounded-xl bg-[var(--bg-card)] p-2.5 text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm cursor-pointer"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Dismiss navigation"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-xs cursor-pointer"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-30 md:static w-64 max-w-[85vw] md:max-w-none bg-[var(--bg-sidebar)] text-[var(--text-primary)] flex flex-col shrink-0 border-r border-[var(--border-color)] h-screen overflow-y-auto transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'
        } md:translate-x-0 md:visible`}
      >
        {/* Brand Header */}
        <div className="p-4 pt-6 md:pt-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Orange rounded square badge */}
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap size={20} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-[var(--text-primary)] text-sm tracking-tight truncate">
                  CampusEnlight
                </span>
                <Sparkles size={13} className="text-[var(--primary)] shrink-0" />
              </div>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] truncate">
                Online Classroom & Exam
              </p>
            </div>
          </div>
        </div>

        {/* Portal Switcher (Teacher vs Student) */}
        <div className="mx-3.5 my-3 p-1 rounded-xl bg-[var(--bg-main)] grid grid-cols-2 gap-1 border border-[var(--border-color)]">
          {(['teacher', 'parent_student'] as const).map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setPortalMode(mode)}
              className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                portalMode === mode
                  ? 'bg-[var(--bg-card)] text-[var(--primary)] font-bold shadow-xs border border-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
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
              className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1"
            >
              Active Student
            </label>
            <select
              id="active-student"
              value={selectedChild.id}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-3 pt-3 pb-1">
                  {group.category}
                </div>
              )}
              {group.items.map((item, iIdx) => {
                const active = isItemActive(item.id, item.label);
                return (
                  <button
                    type="button"
                    key={`${item.id}-${iIdx}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] transition-all group cursor-pointer ${
                      active
                        ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-semibold shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] font-medium'
                    }`}
                  >
                    <span
                      className={`shrink-0 transition-colors ${
                        active
                          ? 'text-[var(--primary)]'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          active
                            ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                            : 'bg-[var(--bg-main)] text-[var(--text-secondary)] group-hover:bg-[var(--border-color)]'
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

        {/* Bottom User Card Matching Style */}
        <div className="p-3 m-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            {teacher ? 'SJ' : selectedChild.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[var(--text-primary)] text-xs truncate">
              {teacher ? 'Prof. Sarah Jenkins' : selectedChild.name}
            </p>
            <p className="text-[10px] font-semibold text-[var(--text-muted)] truncate">
              {teacher ? 'SuperAdmin · Teacher' : `${selectedChild.class} · Student`}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
