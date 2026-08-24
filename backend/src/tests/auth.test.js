process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '3306';
process.env.DB_NAME = process.env.DB_NAME || 'e_utilities_cost';
process.env.DB_USER = process.env.DB_USER || 'app_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'changeme';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../app');
const { sequelize, User, PasswordResetToken } = require('../models');

async function setupDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await User.create({
    username: 'resetuser',
    password: await bcrypt.hash('oldPassword123', 10),
    full_name: 'Reset Tester',
    role: 'admin',
  });
}

test.before(async () => {
  await setupDatabase();
});

test('register creates a new user account', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'newuser',
      password: 'newPassword123',
      full_name: 'New User',
    })
    .expect(201);

  assert.equal(response.body.user.username, 'newuser');
  assert.equal(response.body.user.role, 'staff');

  const saved = await User.findOne({ where: { username: 'newuser' } });
  assert.ok(saved);
  assert.notEqual(saved.password, 'newPassword123');
});

test('register accepts requests from frontend dev origins', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .set('Origin', 'http://localhost:5173')
    .send({
      username: 'devoriginuser',
      password: 'devPassword123',
      full_name: 'Dev Origin User',
    })
    .expect(201);

  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(response.body.user.username, 'devoriginuser');
});

test('forgot password returns a generic success response and creates a reset token', async () => {
  const response = await request(app)
    .post('/api/auth/forgot-password')
    .send({ username: 'resetuser' })
    .expect(200);

  assert.match(response.body.message, /สำเร็จ|ส่ง/);

  const created = await PasswordResetToken.findOne({
    where: { user_id: 1 },
    order: [['created_at', 'DESC']],
  });

  assert.ok(created);
  assert.ok(created.token);
});

test('reset password updates the password when using a valid token', async () => {
  const resetToken = await PasswordResetToken.findOne({
    where: { user_id: 1 },
    order: [['created_at', 'DESC']],
  });

  const response = await request(app)
    .post('/api/auth/reset-password')
    .send({ token: resetToken.token, newPassword: 'newPassword456' })
    .expect(200);

  assert.match(response.body.message, /สำเร็จ|อัปเดต/);

  const user = await User.findByPk(1);
  const isMatch = await bcrypt.compare('newPassword456', user.password);
  assert.equal(isMatch, true);
});
