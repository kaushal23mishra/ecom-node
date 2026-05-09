const addUser = require('../../../../src/use-case/user/addUser');
const response = require('../../../../src/utils/response');

describe('User Use Case: addUser', () => {
  let mockUserDb;
  let mockCreateValidation;

  beforeEach(() => {
    mockUserDb = { create: jest.fn(), };
    mockCreateValidation = jest.fn();
  });

  it('should successfully create a user when data is valid', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com' 
    };
    mockCreateValidation.mockResolvedValue({ isValid: true });
    mockUserDb.create.mockResolvedValue({
      ...userData,
      id: '123' 
    });

    const execute = addUser({
      userDb: mockUserDb,
      createValidation: mockCreateValidation,
    });

    const result = await execute(userData);

    expect(result.status).toBe('SUCCESS');
    expect(result.data).toBeDefined();
    expect(result.data.id).toBe('123');
    expect(mockCreateValidation).toHaveBeenCalledWith(userData);
    expect(mockUserDb.create).toHaveBeenCalled();
  });

  it('should return validation error when data is invalid', async () => {
    const userData = { email: 'invalid' };
    mockCreateValidation.mockResolvedValue({
      isValid: false,
      message: 'Email is invalid',
    });

    const execute = addUser({
      userDb: mockUserDb,
      createValidation: mockCreateValidation,
    });

    const result = await execute(userData);

    expect(result.status).toBe('VALIDATION_ERROR');
    expect(result.message).toContain('Email is invalid');
    expect(mockUserDb.create).not.toHaveBeenCalled();
  });
});
