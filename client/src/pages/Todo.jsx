import React from 'react';
import { Plus } from 'lucide-react';
import ProjectSidebar from '../components/todo/ProjectSidebar';
import TaskList from '../components/todo/TaskList';
import TaskModal from '../components/todo/TaskModal';
import { useTodo } from '../hooks/useTodo';

const Todo = () => {
    const {
        tasks,
        projects,
        loading,
        activeProject,
        setActiveProject,
        isModalOpen,
        editingTask,
        handleAddProject,
        handleDeleteProject,
        handleSaveTask,
        handleToggleTask,
        handleDeleteTask,
        openNewTaskModal,
        openEditTaskModal,
        closeTaskModal,
        handleAddSubtask,
        handleToggleSubtask,
        handleDeleteSubtask
    } = useTodo();

    return (
        <div className="flex h-[calc(100vh-theme('spacing.20'))] max-h-screen overflow-hidden bg-background">
            <ProjectSidebar
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-md">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Tasks
                    </h1>
                    <button
                        onClick={openNewTaskModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        <Plus size={18} />
                        New Task
                    </button>
                </div>

                <TaskList
                    tasks={tasks}
                    loading={loading}
                    activeProject={activeProject}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={openEditTaskModal}
                />
            </div>

            <TaskModal
                key={editingTask?.id ?? 'new-task'}
                isOpen={isModalOpen}
                onClose={closeTaskModal}
                onSave={handleSaveTask}
                task={editingTask}
                projects={projects}
                onAddSubtask={handleAddSubtask}
                onToggleSubtask={handleToggleSubtask}
                onDeleteSubtask={handleDeleteSubtask}
            />
        </div>
    );
};

export default Todo;
