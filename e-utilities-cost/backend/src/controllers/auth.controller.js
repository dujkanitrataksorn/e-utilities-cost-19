const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

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
