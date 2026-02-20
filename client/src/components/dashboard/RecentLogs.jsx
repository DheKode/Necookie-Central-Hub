import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';
import { Terminal, Activity, CheckCircle2, Utensils, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentLogs = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => api.fetchUnifiedHistory(10),
    refetchInterval: 5000
  });

  const getIcon = (type) => {
    switch (type) {
      case 'meal': return { icon: Utensils, color: 'text-emerald-400', dot: 'border-emerald-500' };
      case 'workout': return { icon: Zap, color: 'text-orange-400', dot: 'border-orange-500' };
      case 'session': return { icon: Clock, color: 'text-sky-400', dot: 'border-sky-500' };
      default: return { icon: CheckCircle2, color: 'text-slate-400', dot: 'border-slate-500' };
    }
  };

  return (
    // Note: Kept bg-slate-900 to maintain the "Terminal" aesthetic, but added border-border compatibility
    <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-sm h-full flex flex-col font-mono relative overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
          <Terminal size={12} /> Live_Feed.sh
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {isLoading ? <p className="text-xs text-slate-500 animate-pulse">{'>'} Scanning streams...</p> :
          logs.map((log) => {
            const style = getIcon(log.type);
            return (
              <div key={`${log.type}-${log.id}`} className="flex gap-4 items-start opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-600 pt-1 min-w-[50px] text-right font-sans">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }).replace('about ', '')}
                </span>
                <div className="relative flex-1 pb-4 border-l border-slate-700/50 pl-4">
                  <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border ${style.dot}`} />
                  <div className="flex items-center gap-2">
                    <style.icon size={12} className={style.color} />
                    <p className="text-xs text-slate-300 font-bold">{log.type.toUpperCase()}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.content} {log.secondary_info && <span className="text-slate-600">({log.secondary_info})</span>}
                  </p>
                </div>
              </div>
            );
          })
        }
      </div>
      <div className="mt-2 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600">
        <span>root@necookie_hub</span>
        <span className="flex items-center gap-1.5 text-emerald-500 animate-pulse"><Activity size={10} /> LISTENING</span>
      </div>
    </div>
  );
};
export default RecentLogs;