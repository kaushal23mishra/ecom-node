const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/db/mongoDB/models/user');
const { USER_TYPES } = require('../../../src/constants/authConstant');

describe('User Module Integration', () => {
  let token;
  let adminId;

  beforeAll(async () => {
    // Prepare Admin
    const adminData = {
      username: 'admin_user_test',
      password: 'Password@123',
      email: 'admin_test@example.com',
      userType: USER_TYPES.Admin,
    };
    await User.deleteMany({ username: adminData.username });
    const admin = await User.create(adminData);
    adminId = admin.id;

    const loginRes = await request(app)
      .post('/admin/auth/login')
      .send({
        username: adminData.username,
        password: adminData.password 
      });

    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({ username: 'admin_user_test' });
    await User.deleteMany({ username: 'new_test_user' });
  });

  it('POST /admin/user/create should create a new user', async () => {
    const newUser = {
      username: 'new_test_user',
      password: 'UserPassword@123',
      email: 'new_user@example.com',
      userType: USER_TYPES.User,
    };

    const res = await request(app)
      .post('/admin/user/create')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(200);

    expect(res.body.status).toBe('SUCCESS');
    expect(res.body.data.username).toBe(newUser.username);

    // Verify in DB
    const userInDb = await User.findOne({ username: newUser.username });
    expect(userInDb).toBeDefined();
    expect(userInDb.email).toBe(newUser.email);
  });

  it('POST /admin/user/list should retrieve users', async () => {
    const res = await request(app)
      .post('/admin/user/list')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: {},
        options: { limit: 10 } 
      })
      .expect(200);

    expect(res.body.status).toBe('SUCCESS');
    expect(Array.isArray(res.body.data.data)).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThan(0);
  });
});
