const express = require('express');
const router = express.Router();
const budgetPlanController = require('../controllers/budgetPlan.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.get('/budget-plans', authenticate, budgetPlanController.getAll);
router.get('/budget-plans/status', authenticate, budgetPlanController.status);
router.post('/budget-plans', authenticate, requireRole('admin'), budgetPlanController.create);
router.put('/budget-plans/:id', authenticate, requireRole('admin'), budgetPlanController.update);
router.delete('/budget-plans/:id', authenticate, requireRole('admin'), budgetPlanController.remove);

module.exports = router;