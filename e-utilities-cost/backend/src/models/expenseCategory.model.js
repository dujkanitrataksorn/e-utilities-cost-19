const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExpenseCategory = sequelize.define('ExpenseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'บาท',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'expense_categories',
  updatedAt: false,
});

module.exports = ExpenseCategory;
