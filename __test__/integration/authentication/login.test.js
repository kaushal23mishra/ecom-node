const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/db/mongoDB/models/user');
const {
  USER_TYPES, PLATFORM 
} = require('../../../src/constants/authConstant');

describe('Authentication Integration: Login', () => {
  const testUser = {
    username: 'integration_test_user',
    password: 'Password@123',
    email: 'test@example.com',
    userType: USER_TYPES.Admin, // Assuming this exists
    isActive: true,
    isDeleted: false,
  };

  beforeAll(async () => {
    // Ensure DB is connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }
    // Cleanup and create test user
    await User.deleteMany({ username: testUser.username });
    await User.create(testUser);
  });

  afterAll(async () => {
    await User.deleteMany({ username: testUser.username });
  });

  it('POST /admin/auth/login should return 200 and token on success', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.status).toBe('SUCCESS');
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.username).toBe(testUser.username);
  });

  it('POST /admin/auth/login should return 400 for incorrect password', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send({
        username: testUser.username,
        password: 'WrongPassword',
      })
      .expect(400);

    expect(response.body.status).toBe('BAD_REQUEST');
    expect(response.body.message).toBe('Incorrect password');
  });

  it('POST /admin/auth/login should return 400 for nonexistent user', async () => {
    const response = await request(app)
      .post('/admin/auth/login')
      .send({
        username: 'i_do_not_exist',
        password: 'some_password',
      })
      .expect(400);

    expect(response.body.status).toBe('BAD_REQUEST');
    expect(response.body.message).toBe('User not exists');
  });
});
