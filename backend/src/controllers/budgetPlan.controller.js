const { Op, fn, col, literal } = require('sequelize');
const { BudgetPlan, BudgetCategory, Expense } = require('../models');

// GET /api/budget-plans?year=
// ดึงแผนงบประมาณทั้งหมดของปีที่เลือก พร้อมสรุปการใช้จ่ายจริง
exports.getAll = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const [start, end] = [`${year}-01-01`, `${year}-12-31`];

    const plans = await BudgetPlan.findAll({
      where: { year },
      include: [{ model: BudgetCategory, as: 'budgetCategory', attributes: ['id', 'name', 'code'] }],
      order: [['budget_category_id', 'ASC']],
    });

    // ยอดใช้จ่ายจริงรายเดือนแยกตามหมวดเงิน
    const rows = await Expense.findAll({
      attributes: [
        'budget_category_id',
        [fn('MONTH', col('billing_month')), 'month'],
        [fn('SUM', col('amount')), 'total'],
      ],
      where: { billing_month: { [Op.between]: [start, end] } },
      group: ['budget_category_id', fn('MONTH', col('billing_month'))],
      raw: true,
    });

    const monthlyByCategory = {};
    for (const r of rows) {
      const key = Number(r.budget_category_id);
      if (!monthlyByCategory[key]) monthlyByCategory[key] = Array(12).fill(0);
      monthlyByCategory[key][Number(r.month) - 1] = Number(r.total);
    }

    const data = plans.map((p) => {
      const monthly = monthlyByCategory[p.budget_category_id] || Array(12).fill(0);
      const usedYearly = monthly.reduce((a, b) => a + b, 0);
      const monthlyLimit = p.monthly_limit != null ? Number(p.monthly_limit) : null;
      const yearlyLimit = p.yearly_limit != null ? Number(p.yearly_limit) : null;

      const monthsOver = monthlyLimit
        ? monthly.map((t, i) => ({ month: i + 1, total: t, over: t > monthlyLimit })).filter((m) => m.over)
        : [];

      return {
        id: p.id,
        budget_category_id: p.budget_category_id,
        category_name: p.budgetCategory?.name,
        category_code: p.budgetCategory?.code,
        year: p.year,
        monthly_limit: monthlyLimit,
        yearly_limit: yearlyLimit,
        note: p.note,
        monthly_used: monthly,
        used_yearly: usedYearly,
        monthly_usage_percent: monthlyLimit ? Number(((Math.max(...monthly) / monthlyLimit) * 100).toFixed(1)) : null,
        yearly_usage_percent: yearlyLimit ? Number(((usedYearly / yearlyLimit) * 100).toFixed(1)) : null,
        yearly_remaining: yearlyLimit != null ? Number((yearlyLimit - usedYearly).toFixed(2)) : null,
        months_over: monthsOver,
      };
    });

    res.json({ year, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/budget-plans
exports.create = async (req, res, next) => {
  try {
    const { budget_category_id, year, monthly_limit, yearly_limit, note } = req.body;
    if (!budget_category_id || !year) {
      return res.status(400).json({ message: 'กรุณาเลือกหมวดเงินและระบุปี' });
    }
    if (monthly_limit == null && yearly_limit == null) {
      return res.status(400).json({ message: 'กรุณากรอกวงเงินรายเดือนหรือรายปีอย่างน้อยหนึ่งช่อง' });
    }

    const exists = await BudgetPlan.findOne({ where: { budget_category_id, year } });
    if (exists) {
      return res.status(409).json({ message: 'มีแผนงบประมาณของหมวดเงินนี้ในปีที่เลือกอยู่แล้ว กรุณาใช้การแก้ไข' });
    }

    const item = await BudgetPlan.create({ budget_category_id, year, monthly_limit, yearly_limit, note });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/budget-plans/:id
exports.update = async (req, res, next) => {
  try {
    const item = await BudgetPlan.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });

    const { monthly_limit, yearly_limit, note } = req.body;
    await item.update({ monthly_limit, yearly_limit, note });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/budget-plans/:id
exports.remove = async (req, res, next) => {
  try {
    const item = await BudgetPlan.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
    await item.destroy();
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    next(err);
  }
};

// GET /api/budget-plans/status?year=&month=
// สรุปสถานะการใช้งบประมาณเดือน/ปี สำหรับแสดงการแจ้งเตือนบน Dashboard
exports.status = async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || (now.getFullYear() === year ? now.getMonth() + 1 : 12);
    const [start, end] = [`${year}-01-01`, `${year}-12-31`];
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);

    const plans = await BudgetPlan.findAll({
      where: { year },
      include: [{ model: BudgetCategory, as: 'budgetCategory', attributes: ['name', 'code'] }],
    });

    const monthRows = await Expense.findAll({
      attributes: ['budget_category_id', [fn('SUM', col('amount')), 'total']],
      where: { billing_month: { [Op.between]: [monthStart, monthEnd] } },
      group: ['budget_category_id'],
      raw: true,
    });
    const yearRows = await Expense.findAll({
      attributes: ['budget_category_id', [fn('SUM', col('amount')), 'total']],
      where: { billing_month: { [Op.between]: [start, end] } },
      group: ['budget_category_id'],
      raw: true,
    });

    const monthUsedMap = Object.fromEntries(monthRows.map((r) => [Number(r.budget_category_id), Number(r.total)]));
    const yearUsedMap = Object.fromEntries(yearRows.map((r) => [Number(r.budget_category_id), Number(r.total)]));

    const alerts = [];
    const summary = plans.map((p) => {
      const monthlyLimit = p.monthly_limit != null ? Number(p.monthly_limit) : null;
      const yearlyLimit = p.yearly_limit != null ? Number(p.yearly_limit) : null;
      const usedMonth = monthUsedMap[p.budget_category_id] || 0;
      const usedYear = yearUsedMap[p.budget_category_id] || 0;

      const monthPercent = monthlyLimit ? Number(((usedMonth / monthlyLimit) * 100).toFixed(1)) : null;
      const yearPercent = yearlyLimit ? Number(((usedYear / yearlyLimit) * 100).toFixed(1)) : null;

      let level = 'ok'; // ok | warning | danger
      const percents = [monthPercent, yearPercent].filter((v) => v != null);
      if (percents.some((v) => v >= 100)) level = 'danger';
      else if (percents.some((v) => v >= 80)) level = 'warning';

      if (level !== 'ok') {
        alerts.push({
          budget_plan_id: p.id,
          category_name: p.budgetCategory?.name,
          level,
          month_percent: monthPercent,
          year_percent: yearPercent,
        });
      }

      return {
        budget_plan_id: p.id,
        category_name: p.budgetCategory?.name,
        category_code: p.budgetCategory?.code,
        monthly_limit: monthlyLimit,
        yearly_limit: yearlyLimit,
        used_month: usedMonth,
        used_year: usedYear,
        month_percent: monthPercent,
        year_percent: yearPercent,
        level,
      };
    });

    res.json({ year, month, summary, alerts });
  } catch (err) {
    next(err);
  }
};