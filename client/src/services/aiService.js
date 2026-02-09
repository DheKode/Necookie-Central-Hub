import { supabase } from '../supabaseClient';

const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    return user;
};

const getLocalYYYYMMDD = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const aiService = {
    fetchLatestSummary: async () => {
        const user = await getUser();
        const today = getLocalYYYYMMDD();

        const { data } = await supabase
            .from('daily_summaries')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return data;
    },

    generateDailySummary: async () => {
        console.log("🧠 GATHERING DATA FOR AI...");
        const user = await getUser();

        // 1. Fetch History (Client-side for now, could move to server)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: history } = await supabase
            .from('unified_history')
            .select('*')
            .eq('user_id', user.id)
            .gte('timestamp', startOfDay.toISOString())
            .order('timestamp', { ascending: true });

        if (!history || history.length === 0) {
            console.warn("⚠️ No history found today.");
            return;
        }

        // 2. Format Data
        const activityLog = history.map(h =>
            `- [${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${h.type.toUpperCase()}: ${h.content} ${h.secondary_info ? `(${h.secondary_info})` : ''}`
        ).join('\n');

        console.log("📝 SENDING CONTEXT TO SERVER:\n", activityLog);

        // 3. Prompt
        const prompt = `
      You are Dheyn's personal AI life narrator.
      Here is his ENTIRE activity log for today (from 12:00 AM to now):
      ${activityLog}
      
      INSTRUCTIONS:
      1. Analyze Mood (Journal), Diet (Meals), and Productivity (Tasks/Sessions).
      2. Write a short, witty, "Blog-Style" daily recap (max 3-4 sentences).
      TONE: Gen-Z, unfiltered, supportive but real. Use emojis.
    `;

        try {
            // CALL LOCAL SERVER
            const response = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    userId: user.id
                })
            });

            if (!response.ok) throw new Error(`Server Request Failed: ${response.statusText}`);

            const aiData = await response.json();
            const summaryText = aiData.content;

            // Optimistically save to Supabase from Client (as per original flow)
            // Ideally this moves to Server later
            await supabase.from('daily_summaries').insert([
                { user_id: user.id, content: summaryText, date: getLocalYYYYMMDD() }
            ]);

            return summaryText;
        } catch (error) {
            console.error("❌ AI Generation Error:", error);
            return null;
        }
    }
};
