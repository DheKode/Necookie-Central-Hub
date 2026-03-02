export const createMealsService = (supabase, getUser) => ({
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

        return supabase
            .from('meals')
            .insert([{ user_id: user.id, meal_name, calories }]);
    }
});
