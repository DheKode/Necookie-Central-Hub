// --- MAIN ROUTER FILE ---
// This file acts as a central hub for all API routes. 
// It imports modular route files (like ai.routes.js) and attaches them to the main express application.

const express = require('express');
const router = express.Router(); // Create an instance of the Express Router

// Import individual route modules
const aiRoutes = require('./ai.routes');

// Mount the aiRoutes onto the '/ai' path.
// This means any route defined in ai.routes.js will be prefixed with /api/ai 
// (because this router is mounted at /api in index.js)
router.use('/ai', aiRoutes);

// Export the configured router so it can be used in the main index.js file
module.exports = router;
