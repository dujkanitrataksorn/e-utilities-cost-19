require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, ExpenseCategory, BudgetCategory } = require('./models');

const expenseCategories = [
  { name: 'ค่าไฟฟ้า', code: 'ELEC', unit: 'บาท' },
  { name: 'ค่าพลังงาน', code: 'ENERGY', unit: 'บาท' },
  { name: 'ค่าน้ำประปา', code: 'WATER', unit: 'บาท' },
  { name: 'ค่าอินเตอร์เน็ต', code: 'INTERNET', unit: 'บาท' },
  { name: 'ค่าโทรศัพท์', code: 'PHONE', unit: 'บาท' },
  { name: 'ค่าไปรษณีย์', code: 'POST', unit: 'บาท' },
  { name: 'ค่าทิ้งขยะ', code: 'WASTE', unit: 'บาท' },
];

const budgetCategories = [
  { name: 'งบประมาณ (ปวช.)', code: 'BUDGET_LV1' },
  { name: 'งบประมาณ (ปวส.)', code: 'BUDGET_LV2' },
  { name: 'เงินรายได้สถานศึกษา', code: 'SCHOOL_INCOME' },
];

async function seedDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const cat of expenseCategories) {
    await ExpenseCategory.findOrCreate({ where: { code: cat.code }, defaults: cat });
  }
  console.log('✅ Seed expense_categories เรียบร้อย');

  for (const cat of budgetCategories) {
    await BudgetCategory.findOrCreate({ where: { code: cat.code }, defaults: cat });
  }
  console.log('✅ Seed budget_categories เรียบร้อย');

  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin1234', 10);
    await User.create({
      username: 'admin',
      password: hashed,
      full_name: 'ผู้ดูแลระบบ',
      role: 'admin',
    });
    console.log('✅ สร้างผู้ใช้ admin เรียบร้อย (username: admin / password: admin1234)');
    console.log('⚠️  กรุณาเปลี่ยนรหัสผ่านทันทีหลัง login ครั้งแรก');
  } else {
    console.log('ℹ️  มีผู้ใช้ admin อยู่แล้ว ข้ามการสร้าง');
  }

  console.log('🎉 Seed ข้อมูลเสร็จสมบูรณ์');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed ล้มเหลว:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
