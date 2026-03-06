import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Zap, Lock, Mail, AlertCircle, ArrowLeft, Command, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-nc-bg text-nc-text font-sans flex flex-col items-center justify-center relative overflow-hidden transition-theme antialiased">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(rgb(var(--border)_/_0.3)_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nc-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nc-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* NAVIGATION */}
      <div className="absolute top-10 left-10 z-20">
        <Link to="/" className="flex items-center gap-3 text-nc-muted hover:text-nc-text transition-all text-xs font-bold uppercase tracking-[0.2em] group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Return to Hub
        </Link>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-nc-surface border border-nc-border rounded-[2.5rem] p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-nc-primary/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center mb-12">
           <div className="w-16 h-16 bg-nc-surface border border-nc-border rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 mb-8 group transition-all hover:border-nc-primary/50 duration-500">
              <Command size={32} className="text-nc-primary" strokeWidth={2} />
           </div>
           <h2 className="font-sora text-3xl font-bold text-nc-text tracking-tight">Access Instance</h2>
           <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nc-muted mt-3 font-bold text-center">
             Provide encrypted credentials for decryption.
           </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-8 bg-nc-error/10 text-nc-error text-xs font-bold p-4 rounded-xl flex items-center gap-3 border border-nc-error/20 animate-in slide-in-from-top-2">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-nc-muted uppercase tracking-[0.2em] ml-1">Protocol Identifier</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nc-muted group-focus-within:text-nc-primary transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-nc-bg border border-nc-border rounded-xl pl-12 pr-4 py-4 text-nc-text text-sm focus:outline-none focus:border-nc-primary/50 focus:ring-4 focus:ring-nc-primary/5 transition-all placeholder:text-nc-muted/30 font-medium"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-nc-muted uppercase tracking-[0.2em] ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nc-muted group-focus-within:text-nc-primary transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-nc-bg border border-nc-border rounded-xl pl-12 pr-4 py-4 text-nc-text text-sm focus:outline-none focus:border-nc-primary/50 focus:ring-4 focus:ring-nc-primary/5 transition-all placeholder:text-nc-muted/30 font-medium"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-nc-primary text-nc-bg hover:shadow-[0_20px_40px_-10px_rgba(124,155,255,0.4)] font-bold py-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-6 active:scale-[0.98] group text-lg font-sora"
          >
            {loading ? <Zap size={20} className="animate-spin text-nc-bg" /> : (
              <>
                <span>Authenticate</span> 
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* FOOTER */}
      <p className="mt-12 text-nc-muted text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">
        NC_HUB SECURE ACCESS • AUTHORIZED PERSONNEL ONLY
      </p>

    </div>
  );
};

export default Login;