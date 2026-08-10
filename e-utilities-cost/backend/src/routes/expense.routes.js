const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, expenseController.getAll);
router.post('/', authenticate, expenseController.create);
router.get('/:id', authenticate, expenseController.getOne);
router.put('/:id', authenticate, expenseController.update);
router.delete('/:id', authenticate, expenseController.remove);

module.exports = router;
