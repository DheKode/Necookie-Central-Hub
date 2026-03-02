import React, { useEffect, useState, useRef } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';

// Define Themes
const themes = [
  { id: 'light',    name: 'Crisp',    isDark: false, bg: 'bg-slate-100', dot: 'bg-sky-500' },
  { id: 'dark',     name: 'Zinc',     isDark: true,  bg: 'bg-zinc-900',  dot: 'bg-sky-400' },
  { id: 'midnight', name: 'Midnight', isDark: true,  bg: 'bg-slate-900', dot: 'bg-indigo-500' },
  { id: 'forest',   name: 'Forest',   isDark: true,  bg: 'bg-emerald-950', dot: 'bg-emerald-400' },
  { id: 'orken',    name: 'Orken',    isDark: true,  bg: 'bg-neutral-800', dot: 'bg-[#FF6B01]' },
  { id: 'goth',     name: 'Goth',     isDark: true,  bg: 'bg-black',       dot: 'bg-red-600' },
];

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem('theme') || 'light';
};

const syncThemeToDom = (themeId) => {
  const themeObj = themes.find(t => t.id === themeId);
  if (!themeObj) return;

  const html = document.documentElement;
  html.classList.remove('dark', ...themes.map(t => `theme-${t.id}`));
  html.classList.add('transition-theme');

  if (themeObj.isDark) html.classList.add('dark');
  if (themeId !== 'light' && themeId !== 'dark') html.classList.add(`theme-${themeId}`);
};

/**
 * @param {Object} props
 * @param {'sidebar' | 'header'} [props.variant='sidebar'] - Controls layout & positioning
 */
const ThemeSelector = ({ variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(getStoredTheme);
  const dropdownRef = useRef(null);

  function applyTheme(themeId, save = true) {
    const themeObj = themes.find(t => t.id === themeId);
    if (!themeObj) return;

    setActiveTheme(themeId);
    if (save) localStorage.setItem('theme', themeId);
  }

  useEffect(() => {
    syncThemeToDom(activeTheme);
  }, [activeTheme]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- UI CONFIGURATION ---
  const isSidebar = variant === 'sidebar';

  // 1. Button Styling
  const buttonClass = isSidebar 
    ? "flex items-center justify-center p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:bg-surface-highlight transition-all shadow-sm group w-10 h-10"
    : "flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:bg-surface-highlight transition-all shadow-sm group text-sm font-bold";

  // 2. Dropdown Positioning
  const dropdownPosition = isSidebar
    ? "bottom-0 left-full ml-3"  // Sidebar: Pop Right
    : "top-full right-0 mt-2";   // Header: Pop Down-Left

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        title="Change Theme"
      >
        <Palette size={isSidebar ? 20 : 16} className="group-hover:text-primary transition-colors" />
        
        {/* Header Mode shows Text */}
        {!isSidebar && (
          <>
            <span>{themes.find(t => t.id === activeTheme)?.name}</span>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className={`absolute ${dropdownPosition} w-48 bg-surface border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200`}>
          <div className="p-2 space-y-1">
            <p className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-70">
              Aesthetic
            </p>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => { applyTheme(theme.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTheme === theme.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-surface-highlight hover:text-text-main'
                }`}
              >
                {/* Theme Preview Dot */}
                <div className={`relative w-4 h-4 rounded-full border border-gray-400/20 shadow-sm ${theme.bg} overflow-hidden shrink-0`}>
                  <div className={`absolute inset-0 m-auto w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                </div>
                
                <span className="flex-1 text-left">{theme.name}</span>
                
                {/* Active Checkmark */}
                {activeTheme === theme.id && <Check size={14} className="text-primary animate-in zoom-in duration-300" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
