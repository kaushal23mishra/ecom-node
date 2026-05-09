const { USER_TYPES } = require('../../constants/authConstant');

const createFakeUser = (overrides = {}) => ({
    username: `user_${Math.random().toString(36).substring(7)}`,
    password: 'Password@123',
    email: `test_${Math.random().toString(36).substring(7)}@example.com`,
    userType: USER_TYPES.User,
    isActive: true,
    isDeleted: false,
    ...overrides
});

module.exports = {
    createFakeUser,
};
