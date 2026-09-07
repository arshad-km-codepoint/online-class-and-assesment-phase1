import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useExam } from '../../context/ExamContext';

export const Header: React.FC = () => {
  const { addToast } = useExam();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      addToast('Appearance', next ? 'Dark mode enabled.' : 'Light mode enabled.', 'info');
      return next;
    });
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors">
      {/* Spacer for mobile menu toggle alignment */}
      <div className="w-8 md:hidden" />

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => addToast('Notifications', 'You have 6 unread notifications.', 'info')}
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition-colors cursor-pointer"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-error-icon)] text-[9px] font-bold text-white ring-2 ring-[var(--bg-sidebar)]">
            6
          </span>
        </button>

        {/* Top Right User Profile Block */}
        <div className="flex items-center gap-2.5 pl-1.5">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">SuperAdmin</p>
            <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">SUPER_ADMIN</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-extrabold flex items-center justify-center text-xs shadow-xs ring-2 ring-[var(--primary-light)]">
            SU
          </div>
        </div>
      </div>
    </header>
  );
};
