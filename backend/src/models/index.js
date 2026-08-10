const sequelize = require('../config/db');
const User = require('./user.model');
const ExpenseCategory = require('./expenseCategory.model');
const BudgetCategory = require('./budgetCategory.model');
const Expense = require('./expense.model');
const PasswordResetToken = require('./passwordResetToken.model');

// Associations
User.hasMany(Expense, { foreignKey: 'created_by', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id', as: 'passwordResetTokens' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

ExpenseCategory.hasMany(Expense, { foreignKey: 'expense_category_id', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'expense_category_id', as: 'expenseCategory' });

BudgetCategory.hasMany(Expense, { foreignKey: 'budget_category_id', as: 'expenses' });
Expense.belongsTo(BudgetCategory, { foreignKey: 'budget_category_id', as: 'budgetCategory' });

module.exports = {
  sequelize,
  User,
  ExpenseCategory,
  BudgetCategory,
  Expense,
  PasswordResetToken,
};
