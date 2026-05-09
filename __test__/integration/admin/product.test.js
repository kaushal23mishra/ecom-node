const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');

describe('Product Integration', () => {
  it('POST /admin/product/create without token should return 401', async () => {
    const response = await request(app)
      .post('/admin/product/create')
      .send({
        name: 'Test Product',
        price: 100 
      })
      .expect(401);
  });

  it('POST /admin/product/list without token should return 401', async () => {
    const response = await request(app).post('/admin/product/list').expect(401);
  });
});
