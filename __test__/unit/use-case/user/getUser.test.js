const getUser = require('../../../../src/use-case/user/getUser');
const response = require('../../../../src/utils/response');

describe('User Use Case: getUser', () => {
  let mockUserDb;
  let mockFilterValidation;

  beforeEach(() => {
    mockUserDb = { findOne: jest.fn(), };
    mockFilterValidation = jest.fn();
  });

  it('should successfully find a user by query', async () => {
    const params = {
      query: { _id: '123' },
      options: {} 
    };
    const foundUser = {
      _id: '123',
      username: 'testuser' 
    };

    mockFilterValidation.mockResolvedValue({ isValid: true });
    mockUserDb.findOne.mockResolvedValue(foundUser);

    const execute = getUser({
      userDb: mockUserDb,
      filterValidation: mockFilterValidation,
    });

    const result = await execute(params);

    expect(result.status).toBe('SUCCESS');
    expect(result.data).toEqual(foundUser);
    expect(mockUserDb.findOne).toHaveBeenCalledWith(params.query, params.options);
  });

  it('should return record not found if user does not exist', async () => {
    const params = {
      query: { _id: 'nonexistent' },
      options: {} 
    };

    mockFilterValidation.mockResolvedValue({ isValid: true });
    mockUserDb.findOne.mockResolvedValue(null);

    const execute = getUser({
      userDb: mockUserDb,
      filterValidation: mockFilterValidation,
    });

    const result = await execute(params);

    expect(result.status).toBe('RECORD_NOT_FOUND');
  });

  it('should return validation error if options are invalid', async () => {
    const params = {
      query: {},
      options: { invalid: true } 
    };

    mockFilterValidation.mockResolvedValue({
      isValid: false,
      message: 'Invalid options',
    });

    const execute = getUser({
      userDb: mockUserDb,
      filterValidation: mockFilterValidation,
    });

    const result = await execute(params);

    expect(result.status).toBe('VALIDATION_ERROR');
    expect(result.message).toContain('Invalid options');
  });
});
