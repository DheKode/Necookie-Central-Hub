export const createHistoryService = (supabase) => ({
    fetchUnifiedHistory: async (limit = 50) => {
        const { data } = await supabase
            .from('unified_history')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        return data;
    }
});
