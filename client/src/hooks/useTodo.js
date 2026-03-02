import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';

const fetchTodoData = async () => {
    const [tasks, projects] = await Promise.all([
        dataService.fetchTasks(),
        dataService.fetchProjects()
    ]);

    return {
        tasks: tasks || [],
        projects: projects || []
    };
};

const appendSubtask = (tasks, taskId, subtask) => tasks.map((task) => (
    task.id === taskId
        ? { ...task, subtasks: [...(task.subtasks || []), subtask] }
        : task
));

const toggleSubtaskState = (tasks, subtaskId, status) => tasks.map((task) => {
    if (!task.subtasks?.some((subtask) => subtask.id === subtaskId)) {
        return task;
    }

    return {
        ...task,
        subtasks: task.subtasks.map((subtask) => (
            subtask.id === subtaskId
                ? { ...subtask, completed: status }
                : subtask
        ))
    };
});

const removeSubtask = (tasks, subtaskId) => tasks.map((task) => (
    task.subtasks
        ? { ...task, subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId) }
        : task
));

export const useTodo = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeProject, setActiveProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const loadData = async () => {
        setLoading(true);

        try {
            const nextData = await fetchTodoData();
            setTasks(nextData.tasks);
            setProjects(nextData.projects);
        } catch (error) {
            console.error('Failed to load todo data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadInitialData = async () => {
            setLoading(true);

            try {
                const nextData = await fetchTodoData();
                if (isMounted) {
                    setTasks(nextData.tasks);
                    setProjects(nextData.projects);
                }
            } catch (error) {
                console.error('Failed to load todo data', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAddProject = async () => {
        const name = prompt('Project Name:');
        if (!name) {
            return;
        }

        const { data, error } = await dataService.addProject({ name });
        if (!error && data?.[0]) {
            setProjects((currentProjects) => [...currentProjects, data[0]]);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Delete this project and its tasks?')) {
            return;
        }

        const { error } = await dataService.deleteProject(id);
        if (!error) {
            setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));
            setActiveProject((currentProject) => (currentProject?.id === id ? null : currentProject));
        }
    };

    const handleSaveTask = async (taskData) => {
        try {
            const result = taskData.id
                ? await dataService.updateTask(taskData.id, taskData)
                : await dataService.addTask(taskData);

            if (result.error) {
                console.error('Save failed:', result.error);
                alert(`Failed to save task: ${result.error?.message || JSON.stringify(result.error)}`);
                return;
            }

            setIsModalOpen(false);
            setEditingTask(null);
            await loadData();
        } catch (error) {
            console.error('CRITICAL SAVE ERROR:', error);
            alert(`Critical error saving task: ${error.message}`);
        }
    };

    const handleToggleTask = async (id, status) => {
        setTasks((currentTasks) => currentTasks.map((task) => (
            task.id === id ? { ...task, completed: status } : task
        )));

        await dataService.toggleTask({ id, status });
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Delete task?')) {
            return;
        }

        const { error } = await dataService.deleteTask(id);
        if (!error) {
            setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
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

    const closeTaskModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleAddSubtask = async (taskId, title) => {
        const { data, error } = await dataService.addSubtask({ task_id: taskId, title });
        if (!error && data?.[0]) {
            setTasks((currentTasks) => appendSubtask(currentTasks, taskId, data[0]));
        }
    };

    const handleToggleSubtask = async (subtaskId, status) => {
        setTasks((currentTasks) => toggleSubtaskState(currentTasks, subtaskId, status));
        await dataService.toggleSubtask(subtaskId, status);
    };

    const handleDeleteSubtask = async (subtaskId) => {
        await dataService.deleteSubtask(subtaskId);
        setTasks((currentTasks) => removeSubtask(currentTasks, subtaskId));
    };

    return {
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
    };
};
