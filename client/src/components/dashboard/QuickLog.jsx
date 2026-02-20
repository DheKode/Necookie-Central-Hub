import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const QuickLog = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: api.addTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['history']);
      api.generateDailySummary();
      setInput("");
    }
  });

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm h-full flex flex-col justify-center">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && mutation.mutate(input)}
          placeholder="What are you doing?"
          className="flex-1 bg-background border rounded-xl px-5 py-4 text-text-main outline-none focus:ring-2 border-border focus:border-primary transition-all"
        />
        <button
          onClick={() => mutation.mutate(input)}
          disabled={mutation.isPending}
          className="p-4 rounded-xl bg-primary text-white hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default QuickLog;