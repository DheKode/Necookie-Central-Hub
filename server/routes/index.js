const express = require('express');
const router = express.Router();
const aiRoutes = require('./ai.routes');

router.use('/ai', aiRoutes);

module.exports = router;
