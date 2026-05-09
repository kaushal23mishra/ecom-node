const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');

describe('Common Integration: Health Check', () => {
  it('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health').expect('Content-Type', /json/).expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.uptime).toBeDefined();
  });

  it('GET /health/live should return 200 ALIVE', async () => {
    const response = await request(app).get('/health/live').expect(200);

    expect(response.body.status).toBe('ALIVE');
  });

  it('GET /health/ready should return 200 READY if DB is connected', async () => {
    // Wait for DB to be connected if it hasn't yet
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
    }

    const response = await request(app).get('/health/ready').expect(200);

    expect(response.body.status).toBe('READY');
  });
});
