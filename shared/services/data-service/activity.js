export const createActivityService = (supabase, getUser) => ({
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

        return supabase
            .from('activity_logs')
            .insert([{
                user_id: user.id,
                activity_name,
                category: 'session'
            }])
            .select()
            .single();
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

        return supabase
            .from('sleep_logs')
            .insert([{ user_id: user.id, bed_time: new Date().toISOString() }]);
    },

    wakeUp: async ({ id, bed_time }) => {
        const wakeTime = new Date();
        const start = new Date(bed_time);
        let durationMins = Math.floor((wakeTime - start) / 60000);

        if (durationMins > 20) {
            durationMins -= 15;
        }

        return supabase
            .from('sleep_logs')
            .update({
                wake_time: wakeTime.toISOString(),
                duration_minutes: durationMins
            })
            .eq('id', id);
    }
});
