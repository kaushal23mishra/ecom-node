jest.mock('../../../../src/utils/generateToken', () => jest.fn());

const loginUser = require('../../../../src/use-case/common/loginUser');
const { PLATFORM } = require('../../../../src/constants/authConstant');
const generateToken = require('../../../../src/utils/generateToken');

describe('Common Use Case: loginUser', () => {
  let mockUserDb;
  let mockUserTokensDb;
  let mockUserRoleDb;
  let mockRouteRoleDb;

  beforeEach(() => {
    mockUserDb = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };
    mockUserTokensDb = { create: jest.fn() };
    mockUserRoleDb = {};
    mockRouteRoleDb = {};

    generateToken.mockResolvedValue('mock-token');
  });

  it('should successfully login a valid user', async () => {
    const user = {
      id: '123',
      username: 'testadmin',
      userType: 2, // Admin
      loginRetryLimit: 0,
      isPasswordMatch: jest.fn().mockResolvedValue(true),
      toJSON: () => ({
        id: '123',
        username: 'testadmin',
        userType: 2,
      }),
    };

    mockUserDb.findOne.mockResolvedValue(user);

    const execute = loginUser({
      userDb: mockUserDb,
      userTokensDb: mockUserTokensDb,
      userRoleDb: mockUserRoleDb,
      routeRoleDb: mockRouteRoleDb,
    });

    const result = await execute('testadmin', PLATFORM.ADMIN, 'password123');

    expect(result.status).toBe('SUCCESS');
    expect(result.data.token).toBe('mock-token');
    expect(mockUserTokensDb.create).toHaveBeenCalled();
  });

  it('should return error if user does not exist', async () => {
    mockUserDb.findOne.mockResolvedValue(null);

    const execute = loginUser({
      userDb: mockUserDb,
      userTokensDb: mockUserTokensDb,
      userRoleDb: mockUserRoleDb,
      routeRoleDb: mockRouteRoleDb,
    });

    const result = await execute('nonexistent', PLATFORM.ADMIN, 'password123');

    expect(result.status).toBe('BAD_REQUEST');
    expect(result.message).toBe('User not exists');
  });

  it('should return error for incorrect password', async () => {
    const user = {
      id: '123',
      username: 'testadmin',
      loginRetryLimit: 0,
      isPasswordMatch: jest.fn().mockResolvedValue(false),
      toJSON: () => ({ id: '123' }),
    };

    mockUserDb.findOne.mockResolvedValue(user);

    const execute = loginUser({
      userDb: mockUserDb,
      userTokensDb: mockUserTokensDb,
      userRoleDb: mockUserRoleDb,
      routeRoleDb: mockRouteRoleDb,
    });

    const result = await execute('testadmin', PLATFORM.ADMIN, 'wrongpassword');

    expect(result.status).toBe('BAD_REQUEST');
    expect(result.message).toBe('Incorrect password');
    expect(mockUserDb.updateOne).toHaveBeenCalled();
  });
});
