import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';

const TaskWidget = () => {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: api.fetchTasks });

  const addMutation = useMutation({
    mutationFn: api.addTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['history']);
      api.generateDailySummary();
      setNewTask("");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: api.toggleTask,
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['history']); }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); queryClient.invalidateQueries(['history']); }
  });

  const handleAdd = (e) => { if (e.key === 'Enter' && newTask.trim()) addMutation.mutate(newTask.trim()); };
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm h-full flex flex-col transition-theme">
      <div className="flex justify-between items-center mb-4">
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <CheckSquare size={14} className="text-sky-500" /> Mission Log
        </p>
        <span className="text-[10px] bg-surface-highlight text-text-muted px-2 py-0.5 rounded-full font-mono border border-border">
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-4 pr-1">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-text-muted" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4 italic">No active missions.</p>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className="group flex items-center gap-3 p-2 hover:bg-surface-highlight rounded-lg transition-colors cursor-pointer"
              onClick={() => toggleMutation.mutate({ id: task.id, status: !task.completed })}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${task.completed ? 'bg-sky-500 border-sky-500' : 'border-border bg-background'
                }`}>
                {task.completed && <div className="w-1.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 -translate-y-0.5" />}
              </div>
              <span className={`text-sm flex-1 truncate ${task.completed ? 'text-text-muted line-through decoration-slate-500/50' : 'text-text-main'
                }`}>
                {task.description}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete?")) deleteMutation.mutate(task.id); }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleAdd}
          placeholder="Add new objective..."
          className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-sm text-text-main focus:outline-none focus:border-sky-500 transition-colors font-mono placeholder:text-text-muted"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          <Plus size={18} />
        </div>
      </div>
    </div>
  );
};
export default TaskWidget;