import { supabase } from '../supabaseClient';

/**
 * Helper function to retrieve the currently logged-in user.
 * Many queries require the user's ID to fetch only their specific data.
 * @returns {Object} The user object containing id, email, etc.
 * @throws {Error} If no user is authenticated.
 */
const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    return user;
};

export const dataService = {
    // --- UNIFIED HISTORY ---

    /**
     * Fetches a combined feed of recent user activity.
     * @param {number} limit - Maximum number of records to return (default 50).
     * @returns {Array} List of historical activity records.
     */
    fetchUnifiedHistory: async (limit = 50) => {
        // `from('table_name')` points to a specific table in Supabase.
        // `.select('*')` gets all columns.
        const { data } = await supabase
            .from('unified_history')
            .select('*')
            .order('timestamp', { ascending: false }) // Sort newest first
            .limit(limit);
        return data;
    },

    // --- MEALS ---

    /**
     * Fetches today's logged meals for the current user.
     * @returns {Array} List of meal records for today.
     */
    fetchMeals: async () => {
        const user = await getUser();
        // Create a Date object set to the very start of today (midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // `.eq` (equals) matches the user_id column to the current user's ID.
        // `.gte` (greater than or equal to) ensures we only get records from today onwards.
        const { data } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false });
        return data;
    },

    /**
     * Logs a new meal into the database.
     * @param {Object} payload - Contains meal_name and calories.
     */
    addMeal: async ({ meal_name, calories }) => {
        const user = await getUser();
        // `.insert` adds a new row to the table. An array of objects is passed.
        return supabase.from('meals').insert([{ user_id: user.id, meal_name, calories }]);
    },

    // --- TODO LIST FEATURE (TASKS, PROJECTS, SUBTASKS) ---

    // 1. Projects

    /**
     * Fetches all projects created by the logged-in user.
     * @returns {Array} List of projects.
     */
    fetchProjects: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }); // Oldest first
        return data || [];
    },

    addProject: async ({ name, color, icon }) => {
        const user = await getUser();
        return supabase.from('projects').insert([{ user_id: user.id, name, color, icon }]).select();
    },

    deleteProject: async (id) => {
        return supabase.from('projects').delete().eq('id', id);
    },

    // 2. Tasks (Enhanced)

    /**
     * Fetches tasks and their associated subtasks.
     * This uses Supabase's foreign key relationships to perform a "join".
     * @returns {Array} List of tasks, where each task has a `subtasks` array.
     */
    fetchTasks: async () => {
        const user = await getUser();
        // The syntax `*, subtasks (*)` tells Supabase: 
        // "Get all columns from 'tasks', AND get all related rows from 'subtasks'".
        // This requires a foreign key linking subtasks to tasks in the database.
        const { data } = await supabase
            .from('tasks')
            .select(`
                *,
                subtasks (*)
            `)
            .eq('user_id', user.id)
            .order('completed', { ascending: true }) // Show incomplete tasks at the top
            .order('priority', { ascending: false }) // Show high priority first
            .order('created_at', { ascending: false });
        return data || [];
    },

    /**
     * Adds a new task.
     * @param {Object} taskData - The details of the task.
     */
    addTask: async (taskData) => {
        const user = await getUser();
        const { title, description, project_id, due_date, priority, tags, notes } = taskData;

        // Legacy Support: If 'title' wasn't provided, fallback to 'description'.
        const finalTitle = title || description || 'Untitled Task';

        return supabase.from('tasks').insert([{
            user_id: user.id,
            title: finalTitle,
            description: description, // Kept for backwards compatibility
            // Sanitize: If a value is an empty string, set it to null so the DB constraint doesn't throw an error.
            project_id: project_id || null,
            due_date: due_date || null,
            priority: priority || 'medium',
            tags: tags || [],
            notes,
            completed: false
        }]).select();
    },

    updateTask: async (id, updates) => {
        // Sanitize updates
        const sanitizedUpdates = { ...updates };
        if (sanitizedUpdates.project_id === '') sanitizedUpdates.project_id = null;
        if (sanitizedUpdates.due_date === '') sanitizedUpdates.due_date = null;

        return supabase.from('tasks').update(sanitizedUpdates).eq('id', id).select();
    },

    toggleTask: async ({ id, status }) => {
        return supabase.from('tasks').update({ completed: status }).eq('id', id);
    },

    deleteTask: async (id) => {
        return supabase.from('tasks').delete().eq('id', id);
    },

    // 3. Subtasks
    addSubtask: async ({ task_id, title }) => {
        return supabase.from('subtasks').insert([{ task_id, title, completed: false }]).select();
    },

    toggleSubtask: async (id, status) => {
        return supabase.from('subtasks').update({ completed: status }).eq('id', id);
    },

    deleteSubtask: async (id) => {
        return supabase.from('subtasks').delete().eq('id', id);
    },

    // --- EXERCISE ---
    logWorkout: async ({ type, distance_km, duration_mins }) => {
        const user = await getUser();
        // New Table: activity_logs
        return supabase.from('activity_logs').insert([{
            user_id: user.id,
            activity_name: type,
            category: 'fitness',
            distance_km,
            duration_seconds: duration_mins * 60,
            calories_burned: duration_mins * 8 // Approximation
        }]);
    },

    // --- SESSIONS & SLEEP ---
    fetchActiveSession: async () => {
        const user = await getUser();
        // New Table: activity_logs (category is null or logic implies it's a session if we query by activity_name? 
        // Better: look for open ended items)
        const { data } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', user.id)
            .is('end_time', null)
            .maybeSingle();
        return data;
    },

    startSession: async (activity_name) => {
        const user = await getUser();
        return supabase.from('activity_logs').insert([{
            user_id: user.id,
            activity_name,
            category: 'session'
        }]).select().single();
    },

    stopSession: async ({ id, start_time, comments }) => {
        const endTime = new Date();
        const startTime = new Date(start_time);
        const durationSecs = Math.floor((endTime - startTime) / 1000);
        return supabase
            .from('activity_logs')
            .update({
                end_time: endTime.toISOString(),
                duration_seconds: durationSecs,
                notes: comments // Mapped 'comments' -> 'notes'
            })
            .eq('id', id);
    },

    fetchSleepLogs: async () => {
        const user = await getUser();
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data } = await supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('bed_time', sevenDaysAgo.toISOString()).order('bed_time', { ascending: true });
        return data;
    },

    fetchActiveSleep: async () => {
        const user = await getUser();
        const { data } = await supabase.from('sleep_logs').select('*').eq('user_id', user.id).is('wake_time', null).maybeSingle();
        return data;
    },

    startSleep: async () => {
        const user = await getUser();
        return supabase.from('sleep_logs').insert([{ user_id: user.id, bed_time: new Date().toISOString() }]);
    },

    wakeUp: async ({ id, bed_time }) => {
        const wakeTime = new Date();
        const start = new Date(bed_time);
        let durationMins = Math.floor((wakeTime - start) / 60000);
        if (durationMins > 20) durationMins -= 15;
        return supabase.from('sleep_logs').update({ wake_time: wakeTime.toISOString(), duration_minutes: durationMins }).eq('id', id);
    },

    // --- JOURNAL & PRIVATE ---
    fetchJournal: async () => {
        const user = await getUser();
        // New Table: personal_entries (type = 'journal')
        const { data } = await supabase
            .from('personal_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'journal')
            .order('created_at', { ascending: false });
        return data;
    },

    addJournalEntry: async ({ content, mood }) => {
        const user = await getUser();
        return supabase.from('personal_entries').insert([{
            user_id: user.id,
            content,
            mood,
            type: 'journal',
            is_private: false
        }]);
    },

    deleteJournalEntry: async (id) => {
        return supabase.from('personal_entries').delete().eq('id', id);
    },

    fetchPrivateLogs: async () => {
        const user = await getUser();
        // New Table: personal_entries (type = 'thought')
        const { data } = await supabase
            .from('personal_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'thought')
            .order('created_at', { ascending: false });
        return data;
    },

    // --- FINANCE / BANKING SYSTEM ---

    /**
     * Fetches all financial transactions (income & expenses).
     * Records are sorted by the date the user set, then by actual creation time.
     * @returns {Array} List of finance records.
     */
    fetchFinanceRecords: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('finance_records')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false }) // Primary sort: the date picker value
            .order('created_at', { ascending: false }); // Secondary sort: insertion timestamp
        return data;
    },

    /**
     * Inserts a new financial record.
     * @param {Object} recordData - Contains type ('income'|'expense'), amount, category, etc.
     */
    addFinanceRecord: async ({ type, amount, category, description, date, payment_method, is_recurring, recurrence_interval }) => {
        const user = await getUser();
        return supabase.from('finance_records').insert([{
            user_id: user.id,
            type,
            amount,
            category,
            description,
            date,
            payment_method,
            is_recurring,
            recurrence_interval
        }]).select();
    },

    deleteFinanceRecord: async (id) => {
        return supabase.from('finance_records').delete().eq('id', id);
    },

    // --- FINANCE FUNDS (RESERVED) ---
    fetchFunds: async () => {
        const user = await getUser();
        // New Table: finance_goals (type = 'fund')
        const { data } = await supabase
            .from('finance_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'fund')
            .order('created_at', { ascending: true });

        // Map back to expected format if needed (hex_color -> color)
        return data?.map(d => ({ ...d, color: d.hex_color }));
    },

    addFund: async (fundData) => {
        const user = await getUser();
        // Map 'color' input to 'hex_color'
        const { color, ...rest } = fundData;
        return supabase.from('finance_goals').insert([{
            ...rest,
            hex_color: color,
            type: 'fund',
            user_id: user.id
        }]).select();
    },

    updateFund: async (id, updates) => {
        // Map 'color' input to 'hex_color' if present
        const { color, ...rest } = updates;
        const finalUpdates = color ? { ...rest, hex_color: color } : rest;
        return supabase.from('finance_goals').update(finalUpdates).eq('id', id).select();
    },

    deleteFund: async (id) => {
        return supabase.from('finance_goals').delete().eq('id', id);
    },

    // --- FINANCE GOALS (SAVINGS) ---

    /**
     * Fetches saving goals and emergency funds.
     * NOTE: Both standard goals and the emergency fund live in the same `finance_goals` table,
     * differentiated by the `type` column.
     * @returns {Array} List of goals, mapped for the UI.
     */
    fetchGoals: async () => {
        const user = await getUser();
        // `.in` acts like SQL's IN clause, fetching rows where `type` is exactly 'goal' OR 'emergency'.
        const { data } = await supabase
            .from('finance_goals')
            .select('*')
            .eq('user_id', user.id)
            .in('type', ['goal', 'emergency'])
            .order('deadline', { ascending: true }); // Show earliest deadlines first

        // Map the database `type` string back to a boolean `is_emergency_fund` 
        // to keep our React UI logic simple.
        return data?.map(d => ({
            ...d,
            is_emergency_fund: d.type === 'emergency'
        }));
    },

    addGoal: async (goalData) => {
        const user = await getUser();
        // Map 'is_emergency_fund' to 'type'
        const { is_emergency_fund, ...rest } = goalData;
        const type = is_emergency_fund ? 'emergency' : 'goal';

        return supabase.from('finance_goals').insert([{
            ...rest,
            type,
            user_id: user.id
        }]).select();
    },

    updateGoal: async (id, updates) => {
        const { is_emergency_fund, ...rest } = updates;
        let finalUpdates = { ...rest };
        if (is_emergency_fund !== undefined) {
            finalUpdates.type = is_emergency_fund ? 'emergency' : 'goal';
        }
        return supabase.from('finance_goals').update(finalUpdates).eq('id', id).select();
    },

    deleteGoal: async (id) => {
        return supabase.from('finance_goals').delete().eq('id', id);
    }
};
