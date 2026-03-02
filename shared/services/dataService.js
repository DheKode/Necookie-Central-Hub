/**
 * Shared Data Service Factory
 * 
 * This service is used by both web and mobile clients to interact with Supabase.
 * It expects a configured Supabase client instance.
 * 
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase 
 */
export const createDataService = (supabase) => {
    /**
     * Helper function to retrieve the currently logged-in user.
     */
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");
        return user;
    };

    return {
        // --- UNIFIED HISTORY ---
        fetchUnifiedHistory: async (limit = 50) => {
            const { data } = await supabase
                .from('unified_history')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);
            return data;
        },

        // --- MEALS ---
        fetchMeals: async () => {
            const user = await getUser();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false });
            return data;
        },

        addMeal: async ({ meal_name, calories }) => {
            const user = await getUser();
            return supabase.from('meals').insert([{ user_id: user.id, meal_name, calories }]);
        },

        // --- TODO LIST FEATURE ---
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
            return supabase.from('projects').insert([{ user_id: user.id, name, color, icon }]).select();
        },

        deleteProject: async (id) => {
            return supabase.from('projects').delete().eq('id', id);
        },

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
            const { title, description, project_id, due_date, priority, tags, notes } = taskData;
            const finalTitle = title || description || 'Untitled Task';

            return supabase.from('tasks').insert([{
                user_id: user.id,
                title: finalTitle,
                description: description,
                project_id: project_id || null,
                due_date: due_date || null,
                priority: priority || 'medium',
                tags: tags || [],
                notes,
                completed: false
            }]).select();
        },

        updateTask: async (id, updates) => {
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
            return supabase.from('activity_logs').insert([{
                user_id: user.id,
                activity_name: type,
                category: 'fitness',
                distance_km,
                duration_seconds: duration_mins * 60,
                calories_burned: duration_mins * 8
            }]);
        },

        // --- SESSIONS & SLEEP ---
        fetchActiveSession: async () => {
            const user = await getUser();
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
                    notes: comments
                })
                .eq('id', id);
        },

        fetchSleepLogs: async () => {
            const user = await getUser();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const { data } = await supabase
                .from('sleep_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('bed_time', sevenDaysAgo.toISOString())
                .order('bed_time', { ascending: true });
            return data;
        },

        fetchActiveSleep: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('sleep_logs')
                .select('*')
                .eq('user_id', user.id)
                .is('wake_time', null)
                .maybeSingle();
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
            const { data } = await supabase
                .from('personal_entries')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'thought')
                .order('created_at', { ascending: false });
            return data;
        },

        // --- FINANCE / BANKING ---
        fetchFinanceRecords: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('finance_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });
            return data;
        },

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

        fetchFunds: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('finance_goals')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', 'fund')
                .order('created_at', { ascending: true });

            return data?.map(d => ({ ...d, color: d.hex_color }));
        },

        addFund: async (fundData) => {
            const user = await getUser();
            const { color, ...rest } = fundData;
            return supabase.from('finance_goals').insert([{
                ...rest,
                hex_color: color,
                type: 'fund',
                user_id: user.id
            }]).select();
        },

        updateFund: async (id, updates) => {
            const { color, ...rest } = updates;
            const finalUpdates = color ? { ...rest, hex_color: color } : rest;
            return supabase.from('finance_goals').update(finalUpdates).eq('id', id).select();
        },

        deleteFund: async (id) => {
            return supabase.from('finance_goals').delete().eq('id', id);
        },

        fetchGoals: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('finance_goals')
                .select('*')
                .eq('user_id', user.id)
                .in('type', ['goal', 'emergency'])
                .order('deadline', { ascending: true });

            return data?.map(d => ({
                ...d,
                is_emergency_fund: d.type === 'emergency'
            }));
        },

        addGoal: async (goalData) => {
            const user = await getUser();
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
};
