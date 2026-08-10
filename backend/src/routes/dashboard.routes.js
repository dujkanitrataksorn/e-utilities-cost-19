const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/summary', authenticate, dashboardController.summary);
router.get('/by-category', authenticate, dashboardController.byCategory);
router.get('/by-budget', authenticate, dashboardController.byBudget);
router.get('/compare', authenticate, dashboardController.compare);

module.exports = router;
