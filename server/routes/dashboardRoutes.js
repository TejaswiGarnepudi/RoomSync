const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSummary } = require('../controllers/dashboardController');

router.use(protect);

router.get('/summary', getSummary);

module.exports = router;
