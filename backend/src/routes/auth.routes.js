const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// ป้องกัน brute force login: นับเฉพาะครั้งที่ login ไม่สำเร็จ
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง' },
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);

module.exports = router;
