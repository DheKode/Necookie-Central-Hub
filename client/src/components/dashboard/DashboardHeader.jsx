import React, { useState, useEffect } from 'react';
import { Bell, Zap, Activity, Utensils, Edit3, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import ThemeSelector from '../ThemeSelector'; 

const HeaderInputIcon = ({ detectedType }) => {
  if (detectedType === 'meal') return <Utensils size={14} className="text-nc-success" />;
  if (detectedType === 'workout') return <Activity size={14} className="text-nc-warning" />;
  return <Edit3 size={14} className="text-nc-muted" />;
};

const DashboardHeader = () => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState("");
  const [detectedType, setDetectedType] = useState('general');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const hour = currentDate.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const generateAiMutation = useMutation({
    mutationFn: api.generateDailySummary,
    onSuccess: () => { queryClient.invalidateQueries(['dailySummary']); }
  });

  const triggerUpdate = () => {
    queryClient.invalidateQueries(['history']);
    setTimeout(() => generateAiMutation.mutate(), 500); 
  };

  const mealMutation = useMutation({ 
    mutationFn: (vars) => api.addMeal(vars), 
    onSuccess: () => { queryClient.invalidateQueries(['meals']); triggerUpdate(); }
  });

  const workoutMutation = useMutation({ 
    mutationFn: (vars) => api.logWorkout(vars), 
    onSuccess: () => triggerUpdate()
  });

  const taskMutation = useMutation({ 
    mutationFn: async (text) => {
      await api.addTask(text);
      const tasks = await api.fetchTasks();
      if(tasks[0]) await api.toggleTask({id: tasks[0].id, status: true});
    }, 
    onSuccess: () => triggerUpdate()
  });

  const handleInputChange = (e) => {
    const text = e.target.value;
    setStatus(text);
    const lower = text.toLowerCase();
    
    if (lower.startsWith('ate ') || lower.includes('kcal')) setDetectedType('meal');
    else if (lower.startsWith('ran ') || lower.includes('km') || lower.includes('workout')) setDetectedType('workout');
    else setDetectedType('general');
  };

  const handleLog = async (e) => {
    if (e.key !== 'Enter' || !status.trim()) return;
    const text = status;

    if (detectedType === 'meal') {
        const cals = parseInt((text.match(/(\d+)/) || [0])[0]);
        const name = text.replace(/ate/gi, '').replace(/kcal/gi, '').replace(/(\d+)/g, '').trim() || "Quick Meal";
        mealMutation.mutate({ meal_name: name, calories: cals });
    } else if (detectedType === 'workout') {
        const dist = parseFloat((text.match(/(\d+)\s*km/i) || [null, null])[1]);
        const dur = parseInt((text.match(/(\d+)\s*min/i) || [null, 30])[1]);
        const type = text.toLowerCase().includes('run') ? 'Jogging' : 'Workout';
        workoutMutation.mutate({ type, distance_km: dist, duration_mins: dur });
    } else {
        taskMutation.mutate(text);
    }
    
    setStatus("");
    setDetectedType('general');
  };

  return (
    <header className="h-24 border-b border-nc-border bg-nc-surface/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 sticky top-0 mb-8 transition-theme rounded-b-[2rem] mx-4 md:mx-8 mt-4 shadow-sm">
      
      <div className="flex flex-col justify-center">
        <h1 className="font-sora text-xl md:text-2xl font-bold text-nc-text tracking-tight flex items-center gap-2">
          {greeting}, <span className="text-nc-primary">Dheyn</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <ShieldCheck size={12} className="text-nc-success" />
          <p className="text-[11px] font-mono text-nc-muted uppercase tracking-[0.2em] font-medium">
            {formattedDate} <span className="mx-1 opacity-50">•</span> <span className="text-nc-text">{formattedTime}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        
        {/* Input Field */}
        <div className="hidden lg:flex items-center gap-3 bg-nc-bg border border-nc-border px-4 py-2.5 rounded-xl w-[400px] focus-within:border-nc-primary/50 focus-within:ring-4 focus-within:ring-nc-primary/5 transition-all shadow-inner relative group">
          <div className="shrink-0 transition-colors duration-300">
             <HeaderInputIcon detectedType={detectedType} />
          </div>
          <input 
            type="text" 
            value={status} 
            onChange={handleInputChange} 
            onKeyDown={handleLog} 
            placeholder="Quick log... (e.g., 'Coding', 'Ate Pizza', 'Ran 5km')" 
            className="bg-transparent border-none outline-none text-sm w-full text-nc-text placeholder:text-nc-muted/50 font-medium" 
          />
          <div className="hidden group-focus-within:flex items-center gap-1 absolute right-3 opacity-50">
             <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-nc-border bg-nc-surface text-nc-text">↵</kbd>
          </div>
          {(mealMutation.isPending || workoutMutation.isPending || taskMutation.isPending || generateAiMutation.isPending) && (
             <Zap size={14} className="animate-spin text-nc-primary shrink-0 absolute right-4" />
          )}
        </div>

        {/* Status Indicators */}
        <div className="hidden md:flex flex-col items-end justify-center">
          <p className="text-[9px] font-mono font-bold text-nc-muted uppercase tracking-[0.2em] mb-1.5">Node Status</p>
          <div className="flex items-center justify-end gap-3">
            <span className="px-2 py-0.5 rounded-md bg-nc-surface border border-nc-border text-nc-muted text-[10px] font-mono font-bold tracking-wider">v2.4.0</span>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-nc-success/10 border border-nc-success/20">
               <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nc-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-nc-success"></span>
                </span>
              <span className="text-[10px] font-bold text-nc-success font-mono tracking-wider">SYNCED</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-nc-border pl-6">
          <ThemeSelector variant="header" />
          
          <button className="relative p-2.5 rounded-xl bg-nc-surface border border-nc-border hover:bg-nc-surfaceElevated hover:border-nc-primary/30 transition-all shadow-sm group">
            <Bell size={18} className="text-nc-muted group-hover:text-nc-text transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-nc-error rounded-full border-[1.5px] border-nc-surface shadow-[0_0_8px_rgba(240,106,122,0.6)]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;