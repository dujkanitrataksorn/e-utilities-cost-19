require('dotenv').config();
const app = require('./app');
const { seedDatabase } = require('./seed');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await seedDatabase();
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    app.listen(PORT, () => {
      console.log(`🚀 Server กำลังทำงานที่ port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err.message);
    process.exit(1);
  }
}

start();
