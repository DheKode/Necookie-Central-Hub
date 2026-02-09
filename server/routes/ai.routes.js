const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/summary', aiController.generateSummary);

module.exports = router;
