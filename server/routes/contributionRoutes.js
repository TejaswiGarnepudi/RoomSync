const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getContribution } = require('../controllers/contributionController');

router.use(protect);

router.get('/', getContribution);

module.exports = router;
