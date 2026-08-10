const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, PasswordResetToken } = require('../models');

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'username หรือ password ไม่ถูกต้อง' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      accessToken,
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

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'กรุณากรอก username' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(200).json({
        message: 'หาก username นี้มีอยู่ในระบบ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทันที',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetToken.create({
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    console.log(`Password reset token for ${user.username}: ${token}`);

    return res.status(200).json({
      message: 'หาก username นี้มีอยู่ในระบบ ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้ทันที',
      token,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'กรุณากรอก token และรหัสผ่านใหม่' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
    }

    const resetRecord = await PasswordResetToken.findOne({
      where: {
        token,
        used_at: null,
      },
      include: [{ model: User, as: 'user' }],
    });

    if (!resetRecord) {
      return res.status(400).json({ message: 'token ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ message: 'token ไม่ถูกต้องหรือหมดอายุแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await resetRecord.user.update({ password: hashedPassword });
    await resetRecord.update({ used_at: new Date() });

    return res.status(200).json({
      message: 'ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ message: 'ออกจากระบบสำเร็จ' });
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'ไม่พบ refresh token' });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({ message: 'refresh token ไม่ถูกต้องหรือหมดอายุ' });
    }
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้งาน' });
    }
    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  });
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'full_name', 'role'],
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
