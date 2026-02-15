import React from 'react';
import { Sparkles, Loader2, RefreshCw, Bot } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

// Toggle this to enable/disable maintenance mode
const MAINTENANCE_MODE = true;

const AIBlogCard = () => {
  const queryClient = useQueryClient();

  // 1. Fetch Data
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['dailySummary'],
    queryFn: api.fetchLatestSummary,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
    enabled: !MAINTENANCE_MODE, // Disable fetching in maintenance mode
  });

  // 2. Generate Data
  const generateMutation = useMutation({
    mutationFn: api.generateDailySummary,
    onSuccess: () => {
      queryClient.invalidateQueries(['dailySummary']);
    }
  });

  if (MAINTENANCE_MODE) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-between group transition-theme min-h-[200px]">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-text-muted/10 rounded-xl text-text-muted">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-text-main text-sm">AI Insight</h3>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                MAINTENANCE
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-4 relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-2">
          <Sparkles size={32} className="text-primary/40 animate-pulse" />
          <p className="text-sm font-bold text-text-main">Coming Soon</p>
          <p className="text-xs text-text-muted max-w-[200px]">
            We are upgrading the neural networks. Dheyn's personal narrator will be back shortly!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden h-full flex flex-col justify-between group transition-theme min-h-[200px]">

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles size={18} fill="currentColor" className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-text-main text-sm">AI Insight</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              {isLoading ? "ANALYZING..." : "LIVE ANALYSIS"}
            </p>
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || isLoading}
          className="p-2 hover:bg-surface-highlight rounded-lg text-text-muted hover:text-primary transition-colors disabled:opacity-50"
          title="Regenerate Insight"
        >
          {generateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-4 relative z-10 flex-1">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-3 opacity-50 min-h-[100px]">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-xs">Reading your logs...</span>
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2 min-h-[100px]">
            <Bot size={24} />
            <span className="text-xs text-center">System Offline. <br />Check API connection.</span>
          </div>
        ) : summary && summary.content ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">
              {summary.content}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 min-h-[100px]">
            <Bot size={24} className="opacity-20" />
            <p className="text-xs text-center">No insights available.<br />Log some data to wake me up.</p>
            <button
              onClick={() => generateMutation.mutate()}
              className="mt-2 text-xs text-primary hover:underline font-bold"
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