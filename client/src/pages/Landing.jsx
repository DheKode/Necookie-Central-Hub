import React, { useState } from 'react';
import { 
  LayoutGrid, ArrowRight, Wallet, BookOpen, 
  Activity, Terminal, Lock, Zap, Cpu, 
  ShieldCheck, BarChart3, Globe, Command,
  Database, Fingerprint, Sparkles
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const Landing = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-nc-bg text-nc-text font-sans selection:bg-nc-primary/20 transition-theme overflow-x-hidden antialiased">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(rgb(var(--border)_/_0.3)_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-nc-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-nc-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* MOUNT MODAL */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-40">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 bg-nc-surface border border-nc-border rounded-xl flex items-center justify-center text-nc-primary shadow-lg shadow-black/20 group-hover:border-nc-primary/50 transition-all duration-500">
            <Command size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-sora font-bold text-lg tracking-tight leading-none text-nc-text">
              Necookie
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-nc-muted mt-0.5">
              Central Hub
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold uppercase tracking-widest text-nc-muted">
          <a href="#features" className="hover:text-nc-primary transition-all duration-300">Architecture</a>
          <a href="#vision" className="hover:text-nc-primary transition-all duration-300">Philosophy</a>
          <a href="#security" className="hover:text-nc-primary transition-all duration-300">Core</a>
        </div>

        <button 
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-2.5 rounded-lg bg-nc-surface border border-nc-border hover:border-nc-primary/40 hover:bg-nc-surfaceElevated transition-all font-bold text-[13px] uppercase tracking-wider flex items-center gap-3 group"
        >
          Access Instance
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-24 md:pt-32 md:pb-48">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-nc-surface border border-nc-border text-[11px] font-mono tracking-widest text-nc-muted font-bold uppercase mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nc-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nc-accent"></span>
            </span>
            v2.4.0 — Unified Life OS
          </div>
          
          <h1 className="font-sora text-6xl md:text-8xl font-bold tracking-tighter text-nc-text mb-10 leading-[0.85] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Design your <br />
            <span className="text-nc-primary">existence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-nc-muted max-w-2xl mx-auto leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A quiet command center for the modern strategist. 
            Automate finances, capture cognitive flashes, and optimize your biological runtime in one encrypted space.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-10 py-5 bg-nc-primary text-nc-bg rounded-xl font-bold text-lg hover:shadow-[0_20px_40px_-10px_rgba(124,155,255,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] font-sora"
            >
              Initialize Command
            </button>
            <button 
              className="w-full sm:w-auto px-10 py-5 bg-nc-surface border border-nc-border text-nc-text rounded-xl font-bold text-lg hover:bg-nc-surfaceElevated transition-all flex items-center justify-center gap-3 group"
            >
              <Globe size={20} className="text-nc-muted group-hover:text-nc-primary transition-colors" /> 
              <span className="font-sora">View Protocol</span>
            </button>
          </div>

          {/* DASHBOARD PREVIEW MOCKUP */}
          <div className="mt-32 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-nc-primary/10 via-nc-accent/10 to-nc-primary/10 rounded-[2.5rem] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative bg-nc-surfaceElevated border border-nc-border rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-1000 group-hover:scale-[1.01]">
              {/* Browser bar */}
              <div className="h-10 bg-nc-bg/50 border-b border-nc-border flex items-center px-6 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="ml-6 flex items-center gap-2 px-3 py-1 rounded-md bg-nc-bg/50 border border-nc-border/50">
                  <Lock size={10} className="text-nc-muted" />
                  <div className="h-2 w-32 bg-nc-border/30 rounded-full" />
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-8 grid grid-cols-12 gap-6 h-[400px] md:h-[500px]">
                <div className="col-span-3 space-y-6">
                  <div className="h-40 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6 flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-lg bg-nc-primary/10" />
                        <div className="w-12 h-4 bg-nc-primary/20 rounded-full" />
                     </div>
                     <div className="space-y-2">
                        <div className="h-2 w-2/3 bg-nc-border/50 rounded-full" />
                        <div className="h-6 w-full bg-nc-border/30 rounded-lg" />
                     </div>
                  </div>
                  <div className="h-56 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6">
                     <div className="space-y-4">
                        <div className="h-4 w-1/3 bg-nc-border/50 rounded-full" />
                        {[1,2,3].map(i => (
                          <div key={i} className="flex gap-3">
                            <div className="w-4 h-4 rounded bg-nc-border/30" />
                            <div className="flex-1 h-4 bg-nc-border/20 rounded" />
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
                <div className="col-span-6 space-y-6">
                  <div className="h-24 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-nc-accent/10 border border-nc-accent/20 flex items-center justify-center">
                        <Sparkles size={20} className="text-nc-accent" />
                     </div>
                     <div className="space-y-2 flex-1">
                        <div className="h-2 w-1/4 bg-nc-border/50 rounded-full" />
                        <div className="h-4 w-3/4 bg-nc-border/30 rounded-full" />
                     </div>
                  </div>
                  <div className="h-72 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6 overflow-hidden relative">
                     <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-nc-accent/5 to-transparent" />
                     <div className="flex justify-between mb-8">
                        <div className="h-6 w-32 bg-nc-border/50 rounded-full" />
                        <div className="flex gap-2">
                           {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-md bg-nc-border/30" />)}
                        </div>
                     </div>
                     <div className="flex items-end gap-3 h-40">
                        {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-nc-primary/20 border-t border-nc-primary/30 rounded-t-lg transition-all duration-1000" style={{height: `${h}%`}} />
                        ))}
                     </div>
                  </div>
                </div>
                <div className="col-span-3 space-y-6">
                  <div className="h-72 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6">
                    <div className="space-y-6">
                      <div className="h-4 w-1/2 bg-nc-border/50 rounded-full" />
                      <div className="w-32 h-32 rounded-full border-[10px] border-nc-border/30 border-t-nc-accent mx-auto relative flex items-center justify-center">
                         <div className="h-4 w-12 bg-nc-border/50 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-nc-border/20 rounded-full" />
                        <div className="h-3 w-4/5 bg-nc-border/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="h-24 bg-nc-bg/40 rounded-2xl border border-nc-border/50 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-nc-primary/10" />
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-nc-border/50 rounded-full" />
                        <div className="h-2 w-12 bg-nc-border/30 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE ARCHITECTURE GRID */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="mb-20">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-nc-primary font-bold mb-4 block">Core Modules</span>
          <h2 className="font-sora text-4xl md:text-5xl font-bold tracking-tight text-nc-text mb-6">Built for High-Fidelity Living</h2>
          <p className="text-nc-muted max-w-2xl text-lg leading-relaxed">
            Necookie Hub isn't just a dashboard. It's an extension of your cognitive and physical workspace, 
            built with the same precision as your most trusted development tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Finance - Large */}
          <div className="md:col-span-8 bg-nc-surface border border-nc-border p-10 rounded-[2.5rem] hover:border-nc-primary/40 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <BarChart3 size={280} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-nc-primary/10 text-nc-primary rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={28} />
              </div>
              <h3 className="font-sora text-3xl font-bold mb-4 text-nc-text tracking-tight">Institutional Finance</h3>
              <p className="text-nc-muted text-lg leading-relaxed max-w-lg mb-10">
                Track every satoshi with automated flow analysis. Visualize your capital 
                deployment patterns and optimize your savings with algorithmic precision.
              </p>
              <div className="flex gap-4">
                {['Real-time Sync', 'Vault Encryption', 'Tax Logic'].map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full bg-nc-bg border border-nc-border text-[11px] font-mono text-nc-muted uppercase tracking-wider group-hover:border-nc-primary/30 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Health - Small */}
          <div className="md:col-span-4 bg-nc-surface border border-nc-border p-10 rounded-[2.5rem] hover:border-nc-accent/40 transition-all group">
            <div className="w-14 h-14 bg-nc-accent/10 text-nc-accent rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
              <Activity size={28} />
            </div>
            <h3 className="font-sora text-3xl font-bold mb-4 text-nc-text tracking-tight">Bio-Logic</h3>
            <p className="text-nc-muted text-lg leading-relaxed mb-6">
              Monitor your biological runtime. From sleep architecture to micronutrient balance.
            </p>
            <div className="h-1.5 w-full bg-nc-bg rounded-full overflow-hidden">
               <div className="h-full bg-nc-accent w-2/3 group-hover:translate-x-full transition-transform duration-[3000ms] ease-linear" />
            </div>
          </div>

          {/* Journal - Medium */}
          <div className="md:col-span-4 bg-nc-surface border border-nc-border p-10 rounded-[2.5rem] hover:border-nc-primary/40 transition-all group">
            <div className="w-14 h-14 bg-nc-primary/10 text-nc-primary rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
              <BookOpen size={28} />
            </div>
            <h3 className="font-sora text-3xl font-bold mb-4 text-nc-text tracking-tight">Cognitive Log</h3>
            <p className="text-nc-muted text-lg leading-relaxed">
              Capture your internal monologue in a distraction-free, markdown-native environment.
            </p>
          </div>

          {/* Dev/AI - Wide */}
          <div className="md:col-span-8 bg-nc-surface border border-nc-border p-10 rounded-[2.5rem] hover:border-nc-accent/40 transition-all group flex flex-col md:flex-row gap-12 items-center overflow-hidden">
            <div className="flex-1">
              <div className="w-14 h-14 bg-nc-accent/10 text-nc-accent rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Cpu size={28} />
              </div>
              <h3 className="font-sora text-3xl font-bold mb-4 text-nc-text tracking-tight">Neural Core</h3>
              <p className="text-nc-muted text-lg leading-relaxed">
                Integrated LLM modules process your daily logs to provide summaries, identify behavioral loops, and suggest productivity optimizations.
              </p>
            </div>
            <div className="w-full md:w-2/5 bg-nc-bg border border-nc-border rounded-2xl p-8 font-mono text-xs text-nc-muted/80 relative overflow-hidden shadow-inner group-hover:border-nc-accent/30 transition-colors">
               <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-nc-error/30" />
                  <div className="w-3 h-3 rounded-full bg-nc-warning/30" />
                  <div className="w-3 h-3 rounded-full bg-nc-success/30" />
               </div>
               <div className="space-y-2">
                 <p><span className="text-nc-primary">analysis</span>(<span className="text-nc-accent">identity_log</span>) &#123;</p>
                 <p className="pl-4">sentiment: <span className="text-nc-accent">0.88</span>,</p>
                 <p className="pl-4">focus_state: <span className="text-nc-accent">"FLOW"</span>,</p>
                 <p className="pl-4">anomalies: <span className="text-nc-accent">null</span></p>
                 <p>&#125;</p>
                 <p className="mt-4 text-nc-accent animate-pulse">// Processing patterns...</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PRINCIPLES */}
      <section id="security" className="bg-nc-surface border-y border-nc-border py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-nc-primary/5 text-nc-primary rounded-xl flex items-center justify-center border border-nc-primary/10">
              <Database size={24} />
            </div>
            <h4 className="font-sora text-2xl font-bold text-nc-text">Privacy-First</h4>
            <p className="text-nc-muted leading-relaxed">Your data never leaves your control. Local-first architecture with end-to-end encryption for the Cloud-Sync layer.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-nc-accent/5 text-nc-accent rounded-xl flex items-center justify-center border border-nc-accent/10">
              <Fingerprint size={24} />
            </div>
            <h4 className="font-sora text-2xl font-bold text-nc-text">Self-Sovereign</h4>
            <p className="text-nc-muted leading-relaxed">No tracking. No ads. No data mining. Necookie Hub is a tool you pay for with attention, not identity.</p>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 bg-nc-primary/5 text-nc-primary rounded-xl flex items-center justify-center border border-nc-primary/10">
              <Terminal size={24} />
            </div>
            <h4 className="font-sora text-2xl font-bold text-nc-text">Dev-Oriented</h4>
            <p className="text-nc-muted leading-relaxed">Built with the power of modern web tech. Highly extensible, keyboard-first, and API-ready for power users.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 md:py-64 text-center relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-sora text-5xl md:text-7xl font-bold tracking-tighter text-nc-text mb-10">
            Assume control <br />of your timeline.
          </h2>
          <p className="text-nc-muted text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Stop reacting to life. Start engineering it. Join a circle of high-precision individuals today.
          </p>
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="group relative px-12 py-6 bg-nc-text text-nc-bg rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl hover:shadow-nc-primary/20 font-sora"
          >
            Deploy Your Instance
            <span className="absolute -top-3 -right-3 px-3 py-1 bg-nc-accent text-nc-bg text-[11px] font-mono font-bold rounded-lg shadow-lg">LATEST</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-nc-border py-16 text-nc-muted text-[13px] bg-nc-bg font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nc-surface border border-nc-border rounded-lg flex items-center justify-center text-nc-primary">
              <Command size={16} />
            </div>
            <span className="font-sora font-bold text-nc-text text-base">Necookie Hub</span>
          </div>
          <div className="flex gap-12 font-mono uppercase tracking-widest text-[11px]">
            <a href="#" className="hover:text-nc-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-nc-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-nc-primary transition-colors">Protocols</a>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider">© 2026 NC_HUB. ALL SYSTEMS NOMINAL.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;