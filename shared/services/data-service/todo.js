import { sanitizeNullableField } from './helpers.js';

const sanitizeTaskPayload = ({ title, description, project_id, due_date, priority, tags, notes }) => ({
    title: title || description || 'Untitled Task',
    description,
    project_id: project_id || null,
    due_date: due_date || null,
    priority: priority || 'medium',
    tags: tags || [],
    notes,
    completed: false
});

const sanitizeTaskUpdates = (updates) => ({
    ...updates,
    project_id: sanitizeNullableField(updates.project_id),
    due_date: sanitizeNullableField(updates.due_date)
});

export const createTodoService = (supabase, getUser) => ({
    fetchProjects: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        return data || [];
    },

    addProject: async ({ name, color, icon }) => {
        const user = await getUser();

        return supabase
            .from('projects')
            .insert([{ user_id: user.id, name, color, icon }])
            .select();
    },

    deleteProject: async (id) => supabase.from('projects').delete().eq('id', id),

    fetchTasks: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('tasks')
            .select(`
                *,
                subtasks (*)
            `)
            .eq('user_id', user.id)
            .order('completed', { ascending: true })
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        return data || [];
    },

    addTask: async (taskData) => {
        const user = await getUser();

        return supabase
            .from('tasks')
            .insert([{ user_id: user.id, ...sanitizeTaskPayload(taskData) }])
            .select();
    },

    updateTask: async (id, updates) => supabase
        .from('tasks')
        .update(sanitizeTaskUpdates(updates))
        .eq('id', id)
        .select(),

    toggleTask: async ({ id, status }) => supabase
        .from('tasks')
        .update({ completed: status })
        .eq('id', id),

    deleteTask: async (id) => supabase.from('tasks').delete().eq('id', id),

    addSubtask: async ({ task_id, title }) => supabase
        .from('subtasks')
        .insert([{ task_id, title, completed: false }])
        .select(),

    toggleSubtask: async (id, status) => supabase
        .from('subtasks')
        .update({ completed: status })
        .eq('id', id),

    deleteSubtask: async (id) => supabase.from('subtasks').delete().eq('id', id)
});
