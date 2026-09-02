const { User } = require('../models');

/**
 * GET /api/admin/users
 * ดึงรายชื่อผู้ใช้ทั้งหมด (admin only)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users/:id
 * ดึงข้อมูลผู้ใช้เพียงคนเดียว (admin only)
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/users/:id/role
 * เปลี่ยนบทบาทของผู้ใช้ (admin only)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        message: 'บทบาทต้องเป็น admin หรือ staff เท่านั้น',
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    // ป้องกันไม่ให้ downgrade admin คนเดียวในระบบ
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'ไม่สามารถลดบทบาท admin คนสุดท้ายได้',
        });
      }
    }

    await user.update({ role });
    res.json({
      message: 'อัปเดตบทบาทสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/users/:id
 * ลบผู้ใช้ (admin only)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    // ป้องกันลบ admin คนเดียวในระบบ
    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'ไม่สามารถลบ admin คนสุดท้ายได้',
        });
      }
    }

    await user.destroy();
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/stats
 * ดึงสถิติทั่วไป (admin only)
 */
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const adminCount = await User.count({ where: { role: 'admin' } });
    const staffCount = await User.count({ where: { role: 'staff' } });

    res.json({
      totalUsers,
      adminCount,
      staffCount,
    });
  } catch (err) {
    next(err);
  }
};
