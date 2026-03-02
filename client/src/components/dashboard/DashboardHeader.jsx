import React, { useState, useEffect } from 'react';
import { Bell, Zap, Activity, Utensils, Edit3 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import ThemeSelector from '../ThemeSelector'; 

const HeaderInputIcon = ({ detectedType }) => {
  if (detectedType === 'meal') return <Utensils size={14} className="text-emerald-500" />;
  if (detectedType === 'workout') return <Activity size={14} className="text-orange-500" />;
  return <Edit3 size={14} className="text-text-muted" />;
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
    <header className="h-20 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 z-40 sticky top-0 mb-6 transition-theme">
      
      <div>
        <h1 className="text-xl md:text-2xl font-light text-text-main">
          {greeting}, <span className="font-bold text-primary">Dheyn</span>
        </h1>
        <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
          {formattedDate} • <span className="text-text-main font-bold">{formattedTime}</span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Input Field */}
        <div className="hidden md:flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl w-96 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm relative">
          <div className="shrink-0 transition-colors duration-300">
             <HeaderInputIcon detectedType={detectedType} />
          </div>
          <input 
            type="text" 
            value={status} 
            onChange={handleInputChange} 
            onKeyDown={handleLog} 
            placeholder="Log anything... (e.g., 'Coding', 'Ate Pizza', 'Ran 5km')" 
            className="bg-transparent border-none outline-none text-xs w-full text-text-main placeholder:text-text-muted font-sans" 
          />
          {(mealMutation.isPending || workoutMutation.isPending || taskMutation.isPending || generateAiMutation.isPending) && (
             <Zap size={14} className="animate-spin text-primary shrink-0" />
          )}
        </div>

        {/* Status Indicators */}
        <div className="hidden md:block text-right">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-0.5">System Status</p>
          <div className="flex items-center justify-end gap-3">
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400 text-[9px] font-bold tracking-tight">v0.1</span>
            <div className="flex items-center gap-1.5">
               <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* UPDATED: Pass 'header' variant so it drops DOWN */}
          <ThemeSelector variant="header" />
          
          <button className="relative p-2 rounded-xl bg-surface border border-border hover:bg-background transition-all shadow-sm group">
            <Bell size={20} className="text-text-muted group-hover:text-text-main" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-surface" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
