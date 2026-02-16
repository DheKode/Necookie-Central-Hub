import React, { useState } from 'react';
import { Check, Calendar, ChevronDown, Trash2, Tag, Flag } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine Priority Color
    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'text-rose-500 bg-rose-500/10';
            case 'medium': return 'text-amber-500 bg-amber-500/10';
            case 'low': return 'text-emerald-500 bg-emerald-500/10';
            default: return 'text-text-muted bg-surface-highlight';
        }
    };

    return (
        <div className="group bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/50 overflow-hidden">

            {/* Main Row */}
            <div className="flex items-center p-3 gap-3">

                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id, !task.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed
                            ? 'bg-primary border-primary text-white'
                            : 'border-text-muted hover:border-primary'
                        }`}
                >
                    {task.completed && <Check size={14} />}
                </button>

                {/* Content */}
                <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onEdit(task)}
                >
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-medium truncate ${task.completed ? 'text-text-muted line-through' : 'text-text-main'}`}>
                            {task.title || task.description}
                        </span>

                        {/* Priority Badge */}
                        {task.priority && task.priority !== 'medium' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'high' && <Flag size={8} fill="currentColor" />}
                                {task.priority}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted">
                        {/* Due Date */}
                        {task.due_date && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(task.due_date).toLocaleDateString()}
                            </span>
                        )}

                        {/* Subtasks Count */}
                        {task.subtasks && task.subtasks.length > 0 && (
                            <span>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-2 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskItem;
