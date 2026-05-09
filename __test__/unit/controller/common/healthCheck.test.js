const {
  healthCheck,
  detailedHealthCheck,
} = require('../../../../src/controller/common/healthCheck');
const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');

// Mock mongoose connection
jest.mock('mongoose', () => ({ connection: { readyState: 1, }, }));

describe('Health Check Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    process.env.NODE_ENV = 'test';
  });

  describe('healthCheck', () => {
    it('should return 200 OK with health data', async () => {
      await healthCheck(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.status).toBe('OK');
      expect(data.environment).toBe('test');
    });
  });

  describe('detailedHealthCheck', () => {
    it('should return 200 OK when database is connected', async () => {
      // Mock healthy connection
      mongoose.connection.readyState = 1;

      await detailedHealthCheck(req, res);

      expect(res.statusCode).toBe(200);
      const data = res._getJSONData();
      expect(data.status).toBe('OK');
      expect(data.checks.database.status).toBe('connected');
    });

    it('should throw AppError when database is disconnected', async () => {
      // Mock disconnected
      mongoose.connection.readyState = 0;

      /*
       * Since we use asyncHandler, exceptions are caught by next()
       * In unit tests without actual express, we might need to mock next
       * Or test the underlying function if not wrapped...
       * But wait, our exported function IS the wrapped middleware.
       */

      // We need to pass 'next' to the wrapped function and assert it's called with error
      const next = jest.fn();

      await detailedHealthCheck(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('Database disconnected');
    });
  });
});
