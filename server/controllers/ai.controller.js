const { OpenAI } = require("openai");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase (Service Role Key recommended for server-side operations if needed, 
// using generic client for now as passed context is primary)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

exports.generateSummary = async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log("🧠 Generating AI Summary for User:", userId);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        const summaryText = completion.choices[0].message.content;

        // Optional: Save to Supabase directly from server if needed
        // but client logic handles saving for now to keep things consistent with existing flow.
        // If we want FULL migration, we should save here.
        // Let's return the text first to match existing flow.

        return res.status(200).json({ content: summaryText });
    } catch (error) {
        console.error("❌ AI Generation Error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
