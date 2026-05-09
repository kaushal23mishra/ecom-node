const { AppError } = require('../../../src/utils/AppError');

describe('Utils: AppError', () => {
  it('should create an instance of AppError with correct properties', () => {
    const error = new AppError('Test Error', 400, 'TEST_CODE');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test Error');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_CODE');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it('should default to statusCode 500 if not provided', () => {
    const error = new AppError('Default Error');
    expect(error.statusCode).toBe(500);
  });
});
