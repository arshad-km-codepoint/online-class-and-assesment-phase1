import React from 'react';
import { Bell, Moon } from 'lucide-react';
import { useExam } from '../../context/ExamContext';

export const Header: React.FC = () => {
  const { addToast } = useExam();

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
      {/* Spacer for mobile menu toggle alignment */}
      <div className="w-8 md:hidden" />

      {/* Right Controls Matching Reference Screenshot */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {/* Moon / Dark Mode Icon */}
        <button
          type="button"
          aria-label="Theme mode"
          onClick={() => addToast('Appearance', 'Light mode is currently active.', 'info')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Moon size={17} />
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => addToast('Notifications', 'You have 6 unread notifications.', 'info')}
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
            6
          </span>
        </button>

        {/* Top Right User Profile Block */}
        <div className="flex items-center gap-2.5 pl-1.5">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">SuperAdmin</p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SUPER_ADMIN</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs ring-2 ring-orange-100">
            SU
          </div>
        </div>
      </div>
    </header>
  );
};
