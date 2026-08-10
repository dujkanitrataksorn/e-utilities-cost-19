// จับ error ที่เกิดใน route/controller ทั้งหมด (ต้องอยู่หลังสุดใน app.js)
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: err.errors ? err.errors.map((e) => e.message) : [err.message],
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'เกิดข้อผิดพลาดภายในระบบ',
  });
}

function notFound(req, res) {
  res.status(404).json({ message: 'ไม่พบเส้นทางที่ร้องขอ (Not Found)' });
}

module.exports = { errorHandler, notFound };
