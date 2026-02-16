import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { dataService } from '../services/dataService';
import ProjectSidebar from '../components/todo/ProjectSidebar';
import TaskList from '../components/todo/TaskList';
import TaskModal from '../components/todo/TaskModal';

const Todo = () => {
    // Data State
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeProject, setActiveProject] = useState(null); // null = All Tasks
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // null = New Task

    // Fetch Data on Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedTasks, fetchedProjects] = await Promise.all([
                dataService.fetchTasks(),
                dataService.fetchProjects()
            ]);
            setTasks(fetchedTasks || []);
            setProjects(fetchedProjects || []);
        } catch (err) {
            console.error("Failed to load todo data", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    // Projects
    const handleAddProject = async () => {
        const name = prompt("Project Name:");
        if (!name) return;
        const { data, error } = await dataService.addProject({ name });
        if (!error && data) {
            setProjects([...projects, data[0]]);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm("Delete this project and its tasks?")) return;
        const { error } = await dataService.deleteProject(id);
        if (!error) {
            setProjects(projects.filter(p => p.id !== id));
            if (activeProject?.id === id) setActiveProject(null);
        }
    };

    // Tasks
    const handleSaveTask = async (taskData) => {
        let result;
        if (taskData.id) {
            // Update
            result = await dataService.updateTask(taskData.id, taskData);
            if (!result.error && result.data) {
                setTasks(tasks.map(t => t.id === taskData.id ? result.data[0] : t));
            }
        } else {
            // Create
            result = await dataService.addTask(taskData);
            if (!result.error && result.data) {
                setTasks([result.data[0], ...tasks]);
            }
        }

        if (!result.error) {
            setIsModalOpen(false);
            setEditingTask(null);
            // Refresh to get strict relation data if valid
            loadData();
        }
    };

    const handleToggleTask = async (id, status) => {
        // Optimistic Update
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: status } : t));
        await dataService.toggleTask({ id, status });
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Delete task?")) return;
        const { error } = await dataService.deleteTask(id);
        if (!error) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const openNewTaskModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    // Subtasks
    const handleAddSubtask = async (taskId, title) => {
        const { data, error } = await dataService.addSubtask({ task_id: taskId, title });
        if (!error && data) {
            // We need to update the local state to show the new subtask immediately
            // Complex structure update: find task, add subtask to its subtasks array
            setTasks(prevTasks => prevTasks.map(t => {
                if (t.id === taskId) {
                    return { ...t, subtasks: [...(t.subtasks || []), data[0]] };
                }
                return t;
            }));
        }
    };

    const handleToggleSubtask = async (subtaskId, status) => {
        // Optimistic
        setTasks(prev => prev.map(t => {
            if (t.subtasks && t.subtasks.find(st => st.id === subtaskId)) {
                return {
                    ...t,
                    subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: status } : st)
                };
            }
            return t;
        }));
        await dataService.toggleSubtask(subtaskId, status);
    };

    const handleDeleteSubtask = async (subtaskId) => {
        await dataService.deleteSubtask(subtaskId);
        setTasks(prev => prev.map(t => {
            if (t.subtasks) {
                return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
            }
            return t;
        }));
    };

    return (
        <div className="flex h-[calc(100vh-theme('spacing.20'))] max-h-screen overflow-hidden bg-background">

            {/* Sidebar */}
            <ProjectSidebar
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Toolbar */}
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

                {/* List */}
                <TaskList
                    tasks={tasks}
                    loading={loading}
                    activeProject={activeProject}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={openEditTaskModal}
                />

            </div>

            {/* Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
