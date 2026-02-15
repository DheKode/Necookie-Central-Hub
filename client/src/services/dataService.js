import { supabase } from '../supabaseClient';

const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    return user;
};

export const dataService = {
    // --- UNIFIED HISTORY ---
    fetchUnifiedHistory: async (limit = 50) => {
        const { data } = await supabase.from('unified_history').select('*').order('timestamp', { ascending: false }).limit(limit);
        return data;
    },

    // --- MEALS ---
    fetchMeals: async () => {
        const user = await getUser();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const { data } = await supabase.from('meals').select('*').eq('user_id', user.id).gte('created_at', today.toISOString()).order('created_at', { ascending: false });
        return data;
    },

    addMeal: async ({ meal_name, calories }) => {
        const user = await getUser();
        return supabase.from('meals').insert([{ user_id: user.id, meal_name, calories }]);
    },

    // --- TASKS ---
    fetchTasks: async () => {
        const user = await getUser();
        const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('completed', { ascending: true }).order('created_at', { ascending: false });
        return data;
    },

    addTask: async (description) => {
        const user = await getUser();
        return supabase.from('tasks').insert([{ user_id: user.id, description, completed: false }]);
    },

    toggleTask: async ({ id, status }) => {
        return supabase.from('tasks').update({ completed: status }).eq('id', id);
    },

    deleteTask: async (id) => {
        return supabase.from('tasks').delete().eq('id', id);
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
    fetchFinanceRecords: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('finance_records')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });
        // Handle potential recurring logic here if needed, or in the UI
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
    fetchGoals: async () => {
        const user = await getUser();
        // New Table: finance_goals (type = 'goal' or 'emergency')
        const { data } = await supabase
            .from('finance_goals')
            .select('*')
            .eq('user_id', user.id)
            .in('type', ['goal', 'emergency']) // Fetch both regular goals and emergency funds
            .order('deadline', { ascending: true });

        // Map 'emergency' type back to 'is_emergency_fund' boolean for UI compatibility
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
