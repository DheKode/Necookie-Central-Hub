import React, { useState } from 'react';
import { X, Calendar, Flag, Hash, CheckSquare, Plus, Trash2 } from 'lucide-react';

/**
 * TaskModal Component
 * 
 * This component renders a popup modal for creating or editing tasks.
 * It demonstrates standard React patterns like controlled forms, 
 * side-effects (useEffect), and passing data via props.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Determines if the modal should be visible.
 * @param {Function} props.onClose - Function to call when the user clicks 'Cancel' or the 'X' button.
 * @param {Function} props.onSave - Function to call with the form data when 'Save Task' is clicked.
 * @param {Object|null} props.task - If this is populated, we are in "Edit Mode". If null, we are in "Create Mode".
 */
const createFormData = (task) => ({
    title: task?.title || task?.description || '',
    notes: task?.notes || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    priority: task?.priority || 'medium',
    project_id: task?.project_id || '',
    tags: task?.tags || []
});

const TaskModal = ({
    isOpen,
    onClose,
    onSave,
    task,
    projects,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask
}) => {
    // `useState` hooks manage the data the user is currently typing into the form.
    // Whenever `setFormData` is called, React re-renders this component to show the new values.
    const [formData, setFormData] = useState(() => createFormData(task));

    const [newSubtask, setNewSubtask] = useState('');

    // Fast-fail: if the modal isn't supposed to be open, render absolutely nothing.
    if (!isOpen) return null;

    /**
     * Handles the final save action before passing data up to the parent component.
     */
    const handleSubmit = () => {
        // Validation: Prevent saving completely empty tasks
        if (!formData.title.trim()) return;

        // Pass the local `formData` state up to the parent via the `onSave` prop.
        onSave({
            ...formData,
            id: task?.id // Include the ID only if we are editing an existing task
        });
    };

    const handleAddSubtaskLocal = () => {
        if (!newSubtask.trim() || !task) return; // Can only add subtasks to existing tasks for now
        onAddSubtask(task.id, newSubtask);
        setNewSubtask('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface-highlight/30">
                    <h2 className="font-bold text-lg text-text-main">
                        {task ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-surface-highlight">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Title Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-transparent text-2xl font-bold text-text-main placeholder:text-text-muted/50 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Properties Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Project Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <Hash size={12} /> Project
                            </label>
                            <select
                                value={formData.project_id}
                                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                                className="w-full bg-surface-highlight border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            >
                                <option value="">No Project</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <Calendar size={12} /> Due Date
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full bg-surface-highlight border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none text-text-main"
                            />
                        </div>

                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <Flag size={12} /> Priority
                            </label>
                            <div className="flex bg-surface-highlight rounded-xl p-1">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`flex-1 text-xs font-bold py-1.5 rounded-lg capitalize transition-all ${formData.priority === p
                                            ? 'bg-background shadow-sm text-primary'
                                            : 'text-text-muted hover:text-text-main'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add details..."
                            className="w-full bg-surface-highlight border border-border rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Subtasks (Only visible if task exists) */}
                    {task && (
                        <div className="space-y-3 pt-4 border-t border-border">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <CheckSquare size={12} /> Subtasks
                            </label>

                            {/* Add Subtask Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSubtaskLocal()}
                                    placeholder="Add a step..."
                                    className="flex-1 bg-surface-highlight border border-border rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                />
                                <button
                                    onClick={handleAddSubtaskLocal}
                                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Subtask List */}
                            <div className="space-y-2">
                                {task.subtasks && task.subtasks.map(st => (
                                    <div key={st.id} className="flex items-center gap-3 p-2 hover:bg-surface-highlight rounded-lg group">
                                        <button
                                            onClick={() => onToggleSubtask(st.id, !st.completed)}
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-primary border-primary text-white' : 'border-text-muted'
                                                }`}
                                        >
                                            {st.completed && <Check size={10} />}
                                        </button>
                                        <span className={`flex-1 text-sm ${st.completed ? 'text-text-muted line-through' : 'text-text-main'}`}>
                                            {st.title}
                                        </span>
                                        <button
                                            onClick={() => onDeleteSubtask(st.id)}
                                            className="text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border bg-surface-highlight/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Save Task
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TaskModal;
