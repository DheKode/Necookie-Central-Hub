import React, { useState } from 'react';
import { Activity, Play, Save, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const WorkoutCard = () => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('view');
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const mutation = useMutation({
    mutationFn: api.logWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries(['history']);
      api.generateDailySummary();
      setMode('success');
      setTimeout(() => { setMode('view'); setDistance(""); setDuration(""); }, 2000);
    },
    onError: () => alert("Failed to log run")
  });

  const logRun = () => {
    if (!distance || !duration) return;
    mutation.mutate({ type: 'Jogging', distance_km: parseFloat(distance), duration_mins: parseInt(duration) });
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm h-full relative overflow-hidden group flex flex-col justify-between transition-theme">
      {/* Glow Effect */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div><p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1">Exercise</p><h2 className="text-lg font-medium text-text-main">Jogging</h2></div>
          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><Activity size={20} /></div>
        </div>

        {mode === 'view' && (
          <div className="mt-4">
            <p className="text-xs text-text-muted mb-4">Ready to hit the road?</p>
            <button onClick={() => setMode('input')} className="w-full bg-text-main hover:bg-emerald-500 hover:text-white text-background py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
              <Play size={12} fill="currentColor" /> Log Session
            </button>
          </div>
        )}

        {mode === 'input' && (
          <div className="mt-2 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[9px] font-bold text-text-muted uppercase">KM</label>
                <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono text-text-main" placeholder="3.5" />
              </div>
              <div className="flex-1">
                <label className="text-[9px] font-bold text-text-muted uppercase">MINS</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono text-text-main" placeholder="30" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('view')} className="flex-1 py-2 text-xs text-text-muted hover:text-text-main">Cancel</button>
              <button onClick={logRun} disabled={mutation.isPending} className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        {mode === 'success' && (
          <div className="mt-6 flex flex-col items-center text-emerald-500 animate-pulse">
            <CheckCircle size={32} />
            <span className="text-xs font-bold mt-2">Run Logged!</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default WorkoutCard;