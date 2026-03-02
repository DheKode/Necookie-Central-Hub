export const createJournalService = (supabase, getUser) => ({
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

    deleteJournalEntry: async (id) => supabase
        .from('personal_entries')
        .delete()
        .eq('id', id),

    fetchPrivateLogs: async () => {
        const user = await getUser();
        const { data } = await supabase
            .from('personal_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'thought')
            .order('created_at', { ascending: false });

        return data;
    }
});
