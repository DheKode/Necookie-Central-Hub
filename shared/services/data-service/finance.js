import { mapFundRecord, mapGoalRecord } from './helpers.js';

export const createFinanceService = (supabase, getUser) => ({
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

    deleteFinanceRecord: async (id) => supabase
        .from('finance_records')
        .delete()
        .eq('id', id),

    fetchFunds: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('finance_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'fund')
            .order('created_at', { ascending: true });

        return data?.map(mapFundRecord);
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

        return supabase
            .from('finance_goals')
            .update(finalUpdates)
            .eq('id', id)
            .select();
    },

    deleteFund: async (id) => supabase.from('finance_goals').delete().eq('id', id),

    fetchGoals: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('finance_goals')
            .select('*')
            .eq('user_id', user.id)
            .in('type', ['goal', 'emergency'])
            .order('deadline', { ascending: true });

        return data?.map(mapGoalRecord);
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
        const finalUpdates = is_emergency_fund === undefined
            ? rest
            : { ...rest, type: is_emergency_fund ? 'emergency' : 'goal' };

        return supabase
            .from('finance_goals')
            .update(finalUpdates)
            .eq('id', id)
            .select();
    },

    deleteGoal: async (id) => supabase.from('finance_goals').delete().eq('id', id)
});
