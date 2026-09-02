const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategory.controller');
const budgetCategoryController = require('../controllers/budgetCategory.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

// /api/expense-categories
router.get('/expense-categories', authenticate, expenseCategoryController.getAll);
router.post('/expense-categories', authenticate, requireRole('admin'), expenseCategoryController.create);
router.put('/expense-categories/:id', authenticate, requireRole('admin'), expenseCategoryController.update);
router.delete('/expense-categories/:id', authenticate, requireRole('admin'), expenseCategoryController.remove);

// /api/budget-categories
router.get('/budget-categories', authenticate, budgetCategoryController.getAll);
router.post('/budget-categories', authenticate, requireRole('admin'), budgetCategoryController.create);
router.put('/budget-categories/:id', authenticate, requireRole('admin'), budgetCategoryController.update);
router.delete('/budget-categories/:id', authenticate, requireRole('admin'), budgetCategoryController.remove);

module.exports = router;
