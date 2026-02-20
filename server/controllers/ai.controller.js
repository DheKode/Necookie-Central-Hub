// --- AI CONTROLLER ---
// Controllers hold the implementation logic for our routes. 
// This file specifically handles interactions with the OpenAI API.

const { OpenAI } = require("openai");
const { createClient } = require("@supabase/supabase-js");

// Load backend environment variables (keys, URLs) so they are available on process.env
require("dotenv").config();

// 1. Initialize the OpenAI client using the API key stored securely in environment variables.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 2. Initialize the Supabase client.
// NOTE: We rely heavily on Supabase for database operations.
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

/**
 * Controller function to generate an AI summary based on a user prompt.
 * 
 * @param {Object} req - The Express request object (contains data sent from the client, like req.body).
 * @param {Object} res - The Express response object (used to send data back to the client).
 */
exports.generateSummary = async (req, res) => {
    // We use a try/catch block because making external API calls (to OpenAI) can fail 
    // (e.g., network issues, invalid keys) and we don't want the server to crash.
    try {
        // Extract data sent from the frontend client via the request body.
        const { prompt, userId } = req.body;

        // Validation: Ensure the client actually sent a prompt.
        if (!prompt) {
            // Return a 400 Bad Request HTTP status if data is missing.
            return res.status(400).json({ error: "Prompt is required" });
        }

        // TODO: (Security Flaw) We trust that the `userId` provided by the client is accurate. 
        // A malicious user could theoretically send a request with someone else's userId.
        // FUTURE FIX: Implement JWT verification on the server to validate who is actually making the request.
        console.log(`🧠 Generating AI Summary for User ID: ${userId}`);

        // Call the OpenAI API asynchronously. The 'await' keyword pauses execution of this function 
        // until OpenAI responds, preventing the rest of our code from running prematurely.
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Specifies which OpenAI model to use
            // The messages array simulates a conversation structure.
            messages: [{ role: "user", content: prompt }],
            // Temperature controls randomness. 0.7 offers a balance between focused and creative responses.
            temperature: 0.7,
        });

        // Extract the generated text from the OpenAI response object structure.
        const summaryText = completion.choices[0].message.content;

        // Note regarding Architecture:
        // We currently return the text to the client, and the client saves it to Supabase.
        // For enhanced security and less client-side logic, we could ideally save it to Supabase 
        // directly from this backend controller in the future.

        // Send a 200 OK success response back to the client along with the generated content.
        return res.status(200).json({ content: summaryText });

    } catch (error) {
        // If anything goes wrong in the 'try' block, execution jumps immediately to this 'catch' block.
        console.error("❌ AI Generation Error:", error);

        // Return a 500 Internal Server Error to the client, without exposing sensitive server stack traces.
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message // Exposing the message is okay for debugging, but be wary of exposing too much in production.
        });
    }
};
