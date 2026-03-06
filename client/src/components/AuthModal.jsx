import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Zap, Lock, Mail, AlertCircle, X, LayoutGrid, User, ArrowRight, ShieldCheck, Command } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setFullName('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        if (!fullName.trim()) throw new Error("Please enter your full name.");

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`
            } 
          }
        });
        if (error) throw error;
        setErrorMsg('Account created! Logging you in...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-nc-bg/60 backdrop-blur-xl transition-all duration-500"
        onClick={onClose} 
      />

      {/* CARD */}
      <div className="w-full max-w-md bg-nc-surface border border-nc-border rounded-[2.5rem] p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-nc-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-nc-accent/5 rounded-full blur-3xl" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-nc-muted hover:text-nc-text hover:bg-nc-surfaceElevated rounded-full transition-all border border-transparent hover:border-nc-border"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-12">
           <div className="w-16 h-16 bg-nc-surface border border-nc-border rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 mb-8 group transition-all hover:border-nc-primary/50 duration-500">
              <Command size={32} className="text-nc-primary" strokeWidth={2} />
           </div>
           <h2 className="font-sora text-3xl font-bold text-nc-text tracking-tight text-center">
             {isSignUp ? 'Initialize Entity' : 'Access Instance'}
           </h2>
           <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-nc-muted mt-3 font-bold">
             {isSignUp ? 'Register unique identifier' : 'Provide encrypted credentials'}
           </p>
        </div>

        {errorMsg && (
          <div className="mb-8 bg-nc-error/10 text-nc-error text-xs font-bold p-4 rounded-xl flex items-center gap-3 border border-nc-error/20 animate-in slide-in-from-top-2">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          
          {isSignUp && (
            <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-mono font-bold text-nc-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-nc-muted group-focus-within:text-nc-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Identity Name"
                  className="w-full bg-nc-bg border border-nc-border rounded-xl pl-12 pr-4 py-4 text-nc-text text-sm focus:outline-none focus:border-nc-primary/50 focus:ring-4 focus:ring-nc-primary/5 transition-all placeholder:text-nc-muted/30 font-medium"
                  required={isSignUp}
                />
              </div>
            </div>
          )}
          
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
                <span>{isSignUp ? 'Initialize' : 'Authenticate'}</span> 
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-nc-border text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-nc-muted hover:text-nc-primary transition-colors font-bold uppercase tracking-[0.2em]"
          >
            {isSignUp 
              ? "Existing Entity? Establish Connection" 
              : "New Entity? Request Initialization"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;