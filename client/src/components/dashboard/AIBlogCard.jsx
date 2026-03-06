import React from 'react';
import { Sparkles, Loader2, RefreshCw, Bot } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

// Toggle this to enable/disable maintenance mode
const MAINTENANCE_MODE = true;

/**
 * AIBlogCard Component
 */
const AIBlogCard = () => {
  const queryClient = useQueryClient();

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dailySummary'], 
    queryFn: api.fetchLatestSummary, 
    retry: 1, 
    staleTime: 1000 * 60 * 5, 
    enabled: !MAINTENANCE_MODE, 
  });

  const generateMutation = useMutation({
    mutationFn: api.generateDailySummary, 
    onSuccess: () => {
      queryClient.invalidateQueries(['dailySummary']);
    }
  });

  if (MAINTENANCE_MODE) {
    return (
      <div className="bg-nc-surface border border-nc-border rounded-[1.5rem] p-6 relative overflow-hidden h-full flex flex-col justify-between group transition-theme min-h-[200px]">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-nc-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-nc-primary/10 transition-colors pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-nc-surfaceElevated border border-nc-border rounded-xl text-nc-muted">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-sora font-bold text-nc-text text-sm">AI Insight</h3>
              <p className="text-[10px] text-nc-muted font-mono uppercase tracking-[0.2em]">
                MAINTENANCE
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-4 relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <Sparkles size={32} className="text-nc-primary/40 animate-pulse" />
          <p className="text-sm font-sora font-bold text-nc-text">Coming Soon</p>
          <p className="text-xs text-nc-muted max-w-[200px] leading-relaxed">
            We are upgrading the neural networks. The personal narrator will be back shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nc-surface border border-nc-border rounded-[1.5rem] p-6 relative overflow-hidden h-full flex flex-col justify-between group transition-theme min-h-[200px]">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-nc-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-nc-primary/10 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-nc-primary/10 border border-nc-primary/20 rounded-xl text-nc-primary">
            <Sparkles size={18} fill="currentColor" className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-nc-text text-sm">AI Insight</h3>
            <p className="text-[10px] text-nc-muted font-mono uppercase tracking-[0.2em]">
              {isLoading ? "ANALYZING..." : "LIVE ANALYSIS"}
            </p>
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || isLoading}
          className="p-2.5 hover:bg-nc-surfaceElevated border border-transparent hover:border-nc-border rounded-xl text-nc-muted hover:text-nc-primary transition-all disabled:opacity-50"
          title="Regenerate Insight"
        >
          {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-4 relative z-10 flex-1">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-nc-muted gap-3 opacity-50 min-h-[100px]">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-xs font-mono uppercase tracking-wider">Reading logs...</span>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-nc-error gap-2 min-h-[100px]">
            <Bot size={24} />
            <span className="text-xs text-center font-mono uppercase tracking-wider">System Offline</span>
          </div>
        ) : summary && summary.content ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-nc-text text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {summary.content}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-nc-muted gap-2 min-h-[100px]">
            <Bot size={24} className="opacity-20" />
            <p className="text-xs text-center">No insights available.<br />Log some data to wake me up.</p>
            <button
              onClick={() => generateMutation.mutate()}
              className="mt-2 text-xs text-nc-primary hover:underline font-bold font-mono uppercase tracking-wider"
            >
              Force Analysis
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AIBlogCard;