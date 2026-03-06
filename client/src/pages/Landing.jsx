import React, { useState } from 'react';
import { 
  LayoutGrid, ArrowRight, Wallet, BookOpen, 
  Activity, Terminal, Lock, Zap, Cpu, 
  ShieldCheck, BarChart3, Globe
} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const Landing = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-nc-primary/20 transition-theme overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(rgb(var(--border)_/_0.4)_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nc-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nc-accent/10 blur-[120px] rounded-full" />
      </div>

      {/* MOUNT MODAL */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-40">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tighter">
          <div className="w-9 h-9 bg-nc-primary rounded-lg flex items-center justify-center text-nc-bg shadow-lg shadow-nc-primary/20">
            <LayoutGrid size={18} strokeWidth={2.5} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-nc-text to-nc-muted">
            Necookie Hub
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-nc-muted">
          <a href="#features" className="hover:text-nc-primary transition-colors">Modules</a>
          <a href="#vision" className="hover:text-nc-primary transition-colors">Vision</a>
          <a href="#security" className="hover:text-nc-primary transition-colors">Security</a>
        </div>

        <button 
          onClick={() => setIsAuthOpen(true)}
          className="px-5 py-2 rounded-lg bg-nc-surface border border-nc-border hover:border-nc-primary/50 hover:text-nc-primary transition-all font-semibold text-sm flex items-center gap-2 group"
        >
          Access System
          <div className="w-4 h-4 rounded-full bg-nc-primary/10 flex items-center justify-center group-hover:bg-nc-primary group-hover:text-nc-bg transition-colors">
            <ArrowRight size={10} />
          </div>
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-40">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nc-surfaceElevated border border-nc-border text-[10px] font-mono tracking-widest text-nc-accent font-bold uppercase mb-8 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nc-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nc-accent"></span>
            </span>
            System Version 2.4.0 • Active
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-nc-text mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700">
            The Personal <br />
            <span className="text-nc-primary">Operating System.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-nc-muted max-w-2xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A unified command center for your digital life. 
            Organize finances, optimize health, and capture thoughts with high-fidelity tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-nc-primary text-nc-bg rounded-xl font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(124,155,255,0.5)] transition-all active:scale-[0.98]"
            >
              Initialize Command
            </button>
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-nc-surface border border-nc-border text-nc-text rounded-xl font-bold text-lg hover:bg-nc-surfaceElevated transition-all flex items-center justify-center gap-2"
            >
              <Globe size={18} /> View Docs
            </button>
          </div>

          {/* DASHBOARD PREVIEW MOCKUP */}
          <div className="mt-20 relative animate-in fade-in zoom-in duration-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-nc-primary/20 via-nc-accent/20 to-nc-primary/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-nc-bg border border-nc-border rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] md:aspect-[21/9]">
              <div className="h-8 bg-nc-surface border-b border-nc-border flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-nc-border" />
                <div className="ml-4 h-4 w-32 bg-nc-border/30 rounded-full" />
              </div>
              <div className="p-4 grid grid-cols-4 gap-4 h-full">
                <div className="col-span-1 space-y-4">
                  <div className="h-24 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                  <div className="h-40 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                </div>
                <div className="col-span-2 space-y-4">
                  <div className="h-12 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                  <div className="h-52 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                </div>
                <div className="col-span-1 space-y-4">
                  <div className="h-32 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                  <div className="h-32 bg-nc-surfaceElevated/50 rounded-xl border border-nc-border/50 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-nc-text mb-4">Integrated Modules</h2>
          <p className="text-nc-muted max-w-xl">Every component of Necookie Hub is designed to work in harmony, providing a seamless flow of data across your life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Finance - Large */}
          <div className="md:col-span-8 bg-nc-surface border border-nc-border p-8 rounded-[2rem] hover:border-nc-primary/40 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart3 size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-nc-primary/10 text-nc-primary rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-nc-text">Financial Intelligence</h3>
              <p className="text-nc-muted text-base leading-relaxed max-w-md">
                Master your cash flow with institutional-grade tracking. Visualize spending patterns, 
                set intelligent savings targets, and automate your path to financial freedom.
              </p>
              <div className="mt-8 flex gap-3">
                <span className="px-3 py-1 rounded-lg bg-nc-bg border border-nc-border text-[10px] font-mono text-nc-primary uppercase tracking-wider">Analytics</span>
                <span className="px-3 py-1 rounded-lg bg-nc-bg border border-nc-border text-[10px] font-mono text-nc-primary uppercase tracking-wider">Vault</span>
              </div>
            </div>
          </div>

          {/* Health - Small */}
          <div className="md:col-span-4 bg-nc-surface border border-nc-border p-8 rounded-[2rem] hover:border-nc-accent/40 transition-all group">
            <div className="w-12 h-12 bg-nc-accent/10 text-nc-accent rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-nc-text">Bio-Metric Focus</h3>
            <p className="text-nc-muted text-base leading-relaxed">
              Track your vital signs. From sleep optimization to nutritional balance, 
              keep your biological engine running at peak efficiency.
            </p>
          </div>

          {/* Journal - Medium */}
          <div className="md:col-span-4 bg-nc-surface border border-nc-border p-8 rounded-[2rem] hover:border-nc-primary/40 transition-all group">
            <div className="w-12 h-12 bg-nc-primary/10 text-nc-primary rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-nc-text">Cognitive Log</h3>
            <p className="text-nc-muted text-base leading-relaxed">
              Capture flashes of inspiration and deep reflections in a distraction-free, 
              encrypted environment designed for long-form clarity.
            </p>
          </div>

          {/* Dev/AI - Wide */}
          <div className="md:col-span-8 bg-nc-surface border border-nc-border p-8 rounded-[2rem] hover:border-nc-accent/40 transition-all group flex flex-col md:flex-row gap-10 items-center overflow-hidden">
            <div className="flex-1">
              <div className="w-12 h-12 bg-nc-accent/10 text-nc-accent rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-nc-text">AI Core Optimization</h3>
              <p className="text-nc-muted text-base leading-relaxed">
                Integrated neural modules analyze your data to provide personalized insights, 
                productivity suggestions, and automated task prioritization.
              </p>
            </div>
            <div className="w-full md:w-1/3 bg-nc-bg border border-nc-border rounded-2xl p-6 font-mono text-[10px] text-nc-muted/80 relative overflow-hidden shadow-inner">
               <div className="absolute top-2 right-2 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-nc-accent animate-pulse" />
               </div>
               <div className="space-y-1">
                 <p><span className="text-nc-primary">struct</span> System &#123;</p>
                 <p className="pl-4">mode: <span className="text-nc-accent">"MAX_PERF"</span>,</p>
                 <p className="pl-4">autoScale: <span className="text-nc-accent">true</span>,</p>
                 <p className="pl-4">sync: <span className="text-nc-accent">"REAL_TIME"</span></p>
                 <p>&#125;</p>
                 <p className="mt-4 text-nc-accent">// AI Analyzing patterns...</p>
                 <div className="mt-2 h-1.5 w-full bg-nc-surface rounded-full overflow-hidden">
                    <div className="h-full bg-nc-accent w-2/3 animate-pulse" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / SECURITY SECTION */}
      <section id="security" className="bg-nc-surface border-y border-nc-border py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-nc-primary/10 text-nc-primary rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-xl font-bold text-nc-text">End-to-End Privacy</h4>
            <p className="text-nc-muted text-sm leading-relaxed">Your data belongs to you. Every byte is encrypted and stored according to strict security protocols.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 bg-nc-accent/10 text-nc-accent rounded-lg flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h4 className="text-xl font-bold text-nc-text">Local-First Architecture</h4>
            <p className="text-nc-muted text-sm leading-relaxed">Persistent local storage ensures your dashboard is always available, even without a network connection.</p>
          </div>
          <div className="space-y-4">
            <div className="w-10 h-10 bg-nc-primary/10 text-nc-primary rounded-lg flex items-center justify-center">
              <Terminal size={20} />
            </div>
            <h4 className="text-xl font-bold text-nc-text">Developer Native</h4>
            <p className="text-nc-muted text-sm leading-relaxed">Built by engineers, for engineers. Keyboard shortcuts, CLI integration, and API access come standard.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 md:py-40 text-center relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-nc-text mb-8">
            Ready to upgrade your life?
          </h2>
          <p className="text-nc-muted text-lg mb-12">
            Join the elite circle of individuals who manage their lives with high-precision tools.
          </p>
          <button 
            onClick={() => setIsAuthOpen(true)}
            className="group relative px-10 py-5 bg-nc-text text-nc-bg rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl hover:shadow-nc-primary/20"
          >
            Deploy Your Instance
            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-nc-accent text-nc-bg text-[10px] font-mono font-bold rounded-md">FREE</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-nc-border py-12 text-nc-muted text-sm bg-nc-bg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-nc-text">
            <LayoutGrid size={16} className="text-nc-primary" /> Necookie Hub
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-nc-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-nc-primary transition-colors">GitHub</a>
            <a href="#" className="hover:text-nc-primary transition-colors">Status</a>
          </div>
          <p>© 2026 Necookie Hub. All systems nominal.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;