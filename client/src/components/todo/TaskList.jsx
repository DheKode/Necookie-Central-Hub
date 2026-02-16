import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({
    tasks,
    loading,
    onToggle,
    onDelete,
    onEdit,
    activeProject
}) => {

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted animate-pulse">
                Loading tasks...
            </div>
        );
    }

    // Filter tasks based on active project
    const filteredTasks = activeProject
        ? tasks.filter(t => t.project_id === activeProject.id)
        : tasks;

    if (filteredTasks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-50">
                <div className="w-16 h-16 bg-surface-highlight rounded-2xl mb-4" />
                <p>No tasks found.</p>
                <p className="text-xs">Create one to get started!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2">
            <h2 className="text-xl font-bold mb-4 text-text-main">
                {activeProject ? activeProject.name : 'All Tasks'}
            </h2>

            {filteredTasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />
            ))}
        </div>
    );
};

export default TaskList;
