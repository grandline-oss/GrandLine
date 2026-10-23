'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'pill';
}

export default function ThemeToggle({
  className = '',
  variant = 'icon',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid hydration layout mismatch
    return (
      <div className={`w-8 h-8 rounded-lg bg-stone-800/40 animate-pulse ${className}`} />
    );
  }

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800/90 border border-stone-300/60 dark:border-stone-700/60 text-xs shadow-inner ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
          title="Match System Preference"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    );
  }

  // Simple icon button toggle (cycles light -> dark -> light)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all border border-stone-300/40 dark:border-stone-700/60 bg-stone-100/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 active:scale-95 shadow-xs ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Currently in ${resolvedTheme} mode (click to toggle)`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-stone-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
