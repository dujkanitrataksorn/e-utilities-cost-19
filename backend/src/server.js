require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // sync models -> สร้างตารางอัตโนมัติถ้ายังไม่มี (สำหรับ dev/first run)
    await sequelize.sync();
    console.log('✅ Sync models เรียบร้อย');

    app.listen(PORT, () => {
      console.log(`🚀 Server กำลังทำงานที่ port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err.message);
    process.exit(1);
  }
}

start();
