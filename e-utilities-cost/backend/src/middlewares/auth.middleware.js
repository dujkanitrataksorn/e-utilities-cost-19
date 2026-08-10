const jwt = require('jsonwebtoken');

/**
 * ตรวจสอบ Authorization: Bearer <token> สำหรับทุก endpoint ที่ต้อง login
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'ไม่พบ token กรุณาเข้าสู่ระบบ' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
    req.user = payload; // { id, username, role }
    next();
  });
}

/**
 * ตรวจสอบสิทธิ์เฉพาะ role ที่กำหนด เช่น requireRole('admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงส่วนนี้' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
