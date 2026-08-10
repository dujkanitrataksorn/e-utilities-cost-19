const { Op, fn, col, literal } = require('sequelize');
const { Expense, ExpenseCategory, BudgetCategory } = require('../models');

function yearRange(year) {
  return [`${year}-01-01`, `${year}-12-31`];
}

// GET /api/dashboard/summary?year=
// สรุปยอดรวมรายเดือนทั้งปี + card สรุป (เดือนนี้/เดือนก่อน/% เปลี่ยนแปลง/ยอดรวมปี)
exports.summary = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [start, end] = yearRange(year);

    const rows = await Expense.findAll({
      attributes: [
        [fn('MONTH', col('billing_month')), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      where: { billing_month: { [Op.between]: [start, end] } },
      group: [fn('MONTH', col('billing_month'))],
      order: [[fn('MONTH', col('billing_month')), 'ASC']],
      raw: true,
    });

    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r) => Number(r.month) === i + 1);
      return { month: i + 1, total: found ? Number(found.total) : 0 };
    });

    const now = new Date();
    const currentMonthIdx = now.getFullYear() === year ? now.getMonth() : 11;
    const currentMonthTotal = monthlyTotals[currentMonthIdx]?.total || 0;
    const prevMonthTotal = currentMonthIdx > 0 ? monthlyTotals[currentMonthIdx - 1].total : 0;
    const changePercent =
      prevMonthTotal > 0 ? (((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100).toFixed(2) : null;

    const yearTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0);

    res.json({
      year,
      monthlyTotals,
      cards: {
        currentMonthTotal,
        prevMonthTotal,
        changePercent,
        yearTotal,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/by-category?year=
// สรุปแยกตามประเภทค่าใช้จ่าย (สำหรับกราฟวงกลม)
exports.byCategory = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [start, end] = yearRange(year);

    const rows = await Expense.findAll({
      attributes: [
        'expense_category_id',
        [fn('SUM', col('Expense.amount')), 'total'],
      ],
      include: [{ model: ExpenseCategory, as: 'expenseCategory', attributes: ['name', 'code'] }],
      where: { billing_month: { [Op.between]: [start, end] } },
      group: ['expense_category_id', 'expenseCategory.id'],
      order: [[literal('total'), 'DESC']],
    });

    const result = rows.map((r) => ({
      expense_category_id: r.expense_category_id,
      name: r.expenseCategory?.name,
      code: r.expenseCategory?.code,
      total: Number(r.get('total')),
    }));

    res.json({ year, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/by-budget?year=
// สรุปแยกตามหมวดเงิน (สำหรับกราฟแท่งซ้อน)
exports.byBudget = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [start, end] = yearRange(year);

    const rows = await Expense.findAll({
      attributes: [
        'budget_category_id',
        [fn('MONTH', col('billing_month')), 'month'],
        [fn('SUM', col('Expense.amount')), 'total'],
      ],
      include: [{ model: BudgetCategory, as: 'budgetCategory', attributes: ['name', 'code'] }],
      where: { billing_month: { [Op.between]: [start, end] } },
      group: ['budget_category_id', 'budgetCategory.id', fn('MONTH', col('billing_month'))],
      order: [[fn('MONTH', col('billing_month')), 'ASC']],
    });

    const result = rows.map((r) => ({
      budget_category_id: r.budget_category_id,
      name: r.budgetCategory?.name,
      code: r.budgetCategory?.code,
      month: Number(r.get('month')),
      total: Number(r.get('total')),
    }));

    res.json({ year, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/compare?year1=&year2=
// เปรียบเทียบยอดรวมรายเดือนระหว่าง 2 ปี
exports.compare = async (req, res, next) => {
  try {
    const year1 = Number(req.query.year1) || new Date().getFullYear() - 1;
    const year2 = Number(req.query.year2) || new Date().getFullYear();

    async function getMonthly(year) {
      const [start, end] = yearRange(year);
      const rows = await Expense.findAll({
        attributes: [
          [fn('MONTH', col('billing_month')), 'month'],
          [fn('SUM', col('amount')), 'total'],
        ],
        where: { billing_month: { [Op.between]: [start, end] } },
        group: [fn('MONTH', col('billing_month'))],
        raw: true,
      });
      return Array.from({ length: 12 }, (_, i) => {
        const found = rows.find((r) => Number(r.month) === i + 1);
        return found ? Number(found.total) : 0;
      });
    }

    const [data1, data2] = await Promise.all([getMonthly(year1), getMonthly(year2)]);

    res.json({
      year1,
      year2,
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        [`year_${year1}`]: data1[i],
        [`year_${year2}`]: data2[i],
      })),
      totals: {
        [`year_${year1}`]: data1.reduce((a, b) => a + b, 0),
        [`year_${year2}`]: data2.reduce((a, b) => a + b, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};
