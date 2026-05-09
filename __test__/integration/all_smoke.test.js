const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const User = require('../../src/db/mongoDB/models/user');
const {
  USER_TYPES, PLATFORM 
} = require('../../src/constants/authConstant');

/**
 * SMOKE TEST SUITE
 * This suite dynamically hits a sample of endpoints to ensure basic connectivity
 * and that the server doesn't 500.
 */
describe('Global API Smoke Test', () => {
  let token;
  const testAdmin = {
    username: 'smoke_test_admin',
    password: 'Password@123',
    email: 'smoke@test.com',
    userType: USER_TYPES.Admin,
    isActive: true,
  };

  beforeAll(async () => {
    // 1. Setup DB
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    }
    await User.deleteMany({ username: testAdmin.username });
    await User.create(testAdmin);

    // 2. Get Token
    const loginRes = await request(app)
      .post('/admin/auth/login')
      .send({
        username: testAdmin.username,
        password: testAdmin.password 
      });

    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await User.deleteMany({ username: testAdmin.username });
    // Connection handled by global setup
  });

  const testEndpoint = (method, path, body = {}) => {
    it(`${method.toUpperCase()} ${path} should not return 500`, async () => {
      const req = request(app)[method.toLowerCase()](path);
      if (token) req.set('Authorization', `Bearer ${token}`);

      const res = await req.send(body);
      /*
       * We expect NOT 500. 401/404/400 are "fine" for a smoke test if args are missing,
       * as long as the infrastructure layer is responding.
       */
      expect(res.status).not.toBe(500);
    });
  };

  // --- CORE APIs ---
  describe('Core APIs', () => {
    testEndpoint('GET', '/health');
    testEndpoint('POST', '/admin/user/list', {
      query: {},
      options: { limit: 1 } 
    });
    testEndpoint('POST', '/admin/product/list', {
      query: {},
      options: { limit: 1 } 
    });
    testEndpoint('POST', '/admin/category/list', {
      query: {},
      options: { limit: 1 } 
    });
  });

  // --- ADMIN MODULES ---
  describe('Admin Modules', () => {
    const adminModules = ['banner', 'order', 'cart', 'role', 'city', 'country', 'state'];
    adminModules.forEach((module) => {
      testEndpoint('POST', `/admin/${module}/list`, {
        query: {},
        options: { limit: 1 } 
      });
    });
  });
});
