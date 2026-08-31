const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BudgetPlan = sequelize.define('BudgetPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  budget_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  monthly_limit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'วงเงินสูงสุดต่อเดือน (บาท)',
  },
  yearly_limit: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'วงเงินสูงสุดต่อปี (บาท)',
  },
  note: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'budget_plans',
  indexes: [
    {
      unique: true,
      fields: ['budget_category_id', 'year'],
    },
  ],
});

module.exports = BudgetPlan;