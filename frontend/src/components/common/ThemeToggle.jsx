import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';

export default function ThemeToggle({ size = 'md', variant = 'segmented' }) {
  const { theme, setTheme, toggleTheme } = useAwardHub();
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    return (
      <div
        role="group"
        aria-label="Theme mode selector"
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs transition-colors duration-200 ${
          size === 'sm' ? 'scale-90 origin-right' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={!isDark}
          title="Switch to Light Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            !isDark
              ? 'bg-white text-indigo-900 shadow-xs border border-slate-200/80 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sun className={`w-3.5 h-3.5 transition-colors ${!isDark ? 'text-amber-500 fill-amber-400/20' : 'text-slate-400'}`} />
          <span className="text-[11px] tracking-tight">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={isDark}
          title="Switch to Dark Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-slate-900 text-amber-300 shadow-xs border border-slate-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Moon className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-amber-400 fill-amber-400/20' : 'text-slate-400'}`} />
          <span className="text-[11px] tracking-tight">Dark</span>
        </button>
      </div>
    );
  }

  // Single button toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      } ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 shadow-inner'
          : 'bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 shadow-xs'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'}. Click to switch.`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  );
}
