// --- AI ROUTES ---
// This file defines all the endpoints related to Artificial Intelligence features.

const express = require('express');
// The Router allows us to define routes in a separate file and export them, 
// keeping our application modular and organized.
const router = express.Router();

// Import the AI controller. 
// A "controller" contains the actual business logic (the functions) that execute when a route is hit.
const aiController = require('../controllers/ai.controller');

// TODO: (Security Improvement) Auth Middleware
// Currently, this endpoint is public. We should add authentication middleware here to ensure
// that only logged-in users can access the AI features (e.g., router.post('/summary', requireAuth, aiController.generateSummary)).

// Define a POST route at /summary.
// When a client sends a POST request to /api/ai/summary, the generateSummary function inside the controller will run.
// We use POST instead of GET because we are sending data (a prompt) in the request body.
router.post('/summary', aiController.generateSummary);

// Export the router module so it can be imported in the main routes/index.js file.
module.exports = router;
