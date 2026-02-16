import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/MainLayout';
import { Zap } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
// Login page is removed, it is now inside Landing
import History from './pages/History';
import Diary from './pages/Diary';
import Vault from './pages/Vault';
import Finance from './pages/Finance';
import Todo from './pages/Todo';

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin text-primary"><Zap size={48} fill="currentColor" /></div>
    </div>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>

          {/* PUBLIC ROOT: LANDING (Contains Login Modal) */}
          <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />

          {/* Any attempt to hit /login manually redirects to root */}
          <Route path="/login" element={<Navigate to="/" replace />} />

          {/* PROTECTED APP ROUTES */}
          <Route path="/*" element={session ? (
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/history" element={<History />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/todo" element={<Todo />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            // If logged out, go back to Landing
            <Navigate to="/" />
          )}
          />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;