const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

/**
 * ทุกเส้นทางใน admin routes ต้องได้รับการยืนยันและต้องเป็น admin เท่านั้น
 */

// GET /api/admin/users - ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/users', authenticate, requireRole('admin'), adminController.getAllUsers);

// GET /api/admin/users/:id - ดึงข้อมูลผู้ใช้เพียงคนเดียว
router.get('/users/:id', authenticate, requireRole('admin'), adminController.getUserById);

// PUT /api/admin/users/:id/role - เปลี่ยนบทบาทของผู้ใช้
router.put('/users/:id/role', authenticate, requireRole('admin'), adminController.updateUserRole);

// DELETE /api/admin/users/:id - ลบผู้ใช้
router.delete('/users/:id', authenticate, requireRole('admin'), adminController.deleteUser);

// GET /api/admin/stats - ดึงสถิติทั่วไป
router.get('/stats', authenticate, requireRole('admin'), adminController.getStats);

module.exports = router;
