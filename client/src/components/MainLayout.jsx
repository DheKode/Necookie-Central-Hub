
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid, Clock, BookOpen, Wallet, Lock,
  Menu, X, Zap, LogOut, CheckSquare
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import ThemeSelector from './ThemeSelector';

/**
 * MainLayout Component
 * 
 * This is the primary wrapper for the entire application. It provides the persistent UI
 * elements like the Sidebar (desktop) and Bottom/Top Navigation (mobile).
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The specific page content (e.g., Dashboard, Diary) rendered inside this layout.
 */
const MainLayout = ({ children }) => {
  // `useLocation` is a React Router hook that gives us the current URL.
  // We use this to highlight the active menu icon.
  const location = useLocation();

  // `useState` manages local component state. Here it tracks if the mobile sliding menu is open or closed.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // `useEffect` runs side-effects. This specific effect listens for changes to `location.pathname` (the URL).
  // When the user clicks a link and the route changes, we automatically close the mobile menu.
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Handles user logout by calling the Supabase auth API.
   * Supabase will clear the local session tokens automatically.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    // The outermost wrapper uses `fixed inset-0` to pin it to all 4 corners of the screen,
    // ensuring the app takes up the full viewport height without body scrolling.
    <div className="fixed inset-0 w-full h-full bg-background text-text-main font-sans overflow-hidden flex transition-theme">

      {/* LAYER 0: Background Effects (Removed for Minimalist UI) */}

      {/* LAYER 1: Sidebar (Desktop) */}
      <aside className="hidden md:flex w-20 flex-col items-center py-6 border-r border-border/50 bg-background/50 backdrop-blur-md z-20 relative transition-theme">
        <div className="mb-8 p-2">
          <Link to="/" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Zap size={20} className="text-white fill-white" />
          </Link>
        </div>

        <nav className="flex flex-col gap-6 w-full items-center">
          <NavIcon to="/dashboard" icon={<LayoutGrid size={24} />} active={location.pathname === '/dashboard'} />
          <NavIcon to="/history" icon={<Clock size={24} />} active={location.pathname === '/history'} />
          <NavIcon to="/diary" icon={<BookOpen size={24} />} active={location.pathname === '/diary'} />
          <NavIcon to="/finance" icon={<Wallet size={24} />} active={location.pathname === '/finance'} />
          <NavIcon to="/todo" icon={<CheckSquare size={24} />} active={location.pathname === '/todo'} />

          <div className="h-px w-8 bg-border my-2 transition-colors" />

          <NavIcon to="/vault" icon={<Lock size={22} />} active={location.pathname === '/vault'} danger />
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          {/* THEME SELECTOR - Sidebar Variant (Pops Right) */}
          <div className="scale-90">
            <ThemeSelector variant="sidebar" />
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* LAYER 2: Mobile Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-20 h-full bg-surface border-r border-border flex flex-col items-center py-6 transition-theme" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsMobileMenuOpen(false)} className="mb-8 p-2 text-text-muted hover:text-red-500">
              <X size={24} />
            </button>
            <nav className="flex flex-col gap-6 w-full items-center">
              <NavIcon to="/dashboard" icon={<LayoutGrid size={24} />} active={location.pathname === '/dashboard'} />
              <NavIcon to="/history" icon={<Clock size={24} />} active={location.pathname === '/history'} />
              <NavIcon to="/diary" icon={<BookOpen size={24} />} active={location.pathname === '/diary'} />
              <NavIcon to="/finance" icon={<Wallet size={24} />} active={location.pathname === '/finance'} />
              <NavIcon to="/todo" icon={<CheckSquare size={24} />} active={location.pathname === '/todo'} />
              <NavIcon to="/vault" icon={<Lock size={22} />} active={location.pathname === '/vault'} danger />

              <div className="h-px w-8 bg-border my-2" />

              {/* THEME SELECTOR - Mobile Sidebar (Pops Right) */}
              <div className="scale-90 my-2">
                <ThemeSelector variant="sidebar" />
              </div>

              <button
                onClick={handleLogout}
                className="p-3 rounded-2xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={22} />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* LAYER 3: Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden min-w-0 bg-background transition-theme">

        {/* Mobile Header */}
        <div className="md:hidden p-4 flex justify-between items-center bg-background/80 border-b border-border/50 backdrop-blur-md shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="text-text-muted" />
          </button>
          <span className="font-bold text-text-main">Necookie Hub</span>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

// Helper Component for Sidebar Icons
const NavIcon = ({ to, icon, active, danger }) => (
  <Link to={to} className={`relative group p-3 rounded-2xl transition-all duration-300 ${active
    ? 'bg-primary/10 text-primary'
    : 'text-text-muted hover:text-text-main hover:bg-surface-highlight'
    } ${danger ? 'hover:text-amber-500 hover:bg-amber-500/10' : ''}`}>
    {icon}
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
  </Link>
);

export default MainLayout;