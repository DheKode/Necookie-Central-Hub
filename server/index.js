require('dotenv').config(); // Load environment variables from .env file into process.env

// Log to verify essential environment variables are loaded. 
// Note: We use !! to convert the value to a boolean (true if it exists, false if undefined).
console.log('Env Check -> OpenAI:', !!process.env.OPENAI_API_KEY, '| Supabase:', !!process.env.SUPABASE_URL);

// --- GLOBAL ERROR HANDLING ---
// These catch unexpected errors that might otherwise crash the Node.js process.
// It's a best practice to log them and potentially restart the server using a process manager like PM2.

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION: This means a synchronous error was thrown but not caught by a try/catch block.');
    console.error(err);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('UNHANDLED REJECTION: This means a Promise was rejected but there was no .catch() block to handle it.');
    console.error(reason);
});

// --- EXPRESS SETUP ---
const express = require('express');
const app = express();
const cors = require('cors');

// --- MIDDLEWARE ---
// Middleware functions run before the final route handler. They can modify the request or response objects.

// CORS (Cross-Origin Resource Sharing): Allows our frontend (running on a different port/domain) to make requests to this API.
// Without this, the browser would block the requests.
app.use(cors());

// Body Parser: Automatically parses incoming JSON payloads from HTTP requests and makes them available on `req.body`.
app.use(express.json());

// TODO: (Future Improvement) Security Enhancements
// Consider adding 'helmet' (const helmet = require('helmet'); app.use(helmet());) to set secure HTTP headers.
// Consider adding 'express-rate-limit' to prevent brute-force or DDoS attacks on our API endpoints.

// --- ROUTES ---
// Import our centralized routes file. This keeps index.js clean.
const routes = require('./routes'); // Automatically looks for routes/index.js
// All routes defined in the imported file will be prefixed with '/api'.
app.use('/api', routes);

// A simple health-check route to verify the server is running.
app.get('/', (req, res) => res.send('Necookie API Running'));

// --- START SERVER ---
const PORT = process.env.PORT || 5000; // Fallback to port 5000 if not specified in .env
app.listen(PORT, () => {
    console.log(`🚀 Server is awake and listening on port ${PORT}`);
});