/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User registration, login, and password management
 */

/**
 * @openapi
 * /admin/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: Success }
 *       500: { description: Server Error }
 */

/**
 * @openapi
 * /admin/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate an admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 *       500: { description: Server Error }
 */
import * as authConstant from '../../../constants/authConstant';
import { response, responseHandler, logger } from '../../../utils';

const register = (registerUsecase) => async (req: any, res: any) => {
  try {
    req.body.userType = authConstant.USER_TYPES.Admin;
    let result = await registerUsecase(req.body);
    if (result.status === 'SUCCESS') {
      logger.info('User registered successfully', { username: req.body.username, userType: 'Admin' });
    }
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('Registration error', { error: error.message, stack: error.stack, body: req.body });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const forgotPassword = (forgotPasswordUsecase) => async (req: any, res: any) => {
  try {
    let result = await forgotPasswordUsecase(req.body);
    logger.info('Forgot password request initiated', { email: req.body.email });
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('Forgot password error', { error: error.message, email: req.body.email });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const validateResetPasswordOtp = (validateResetPasswordOtpUsecase) => async (req: any, res: any) => {
  try {
    let result = await validateResetPasswordOtpUsecase(req.body);
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('OTP validation error', { error: error.message, email: req.body.email });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const resetPassword = (resetPasswordUsecase) => async (req: any, res: any) => {
  try {
    let result = await resetPasswordUsecase(req.body);
    logger.info('Password reset successfully', { email: req.body.email });
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('Password reset error', { error: error.message, email: req.body.email });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const authentication = (authenticationUsecase) => async (req: any, res: any) => {
  try {
    let result = await authenticationUsecase(req.body, authConstant.PLATFORM.ADMIN);
    if (result.status === 'SUCCESS') {
      logger.info('User logged in successfully', { username: req.body.username });
    } else {
      logger.warn('Login failed', { username: req.body.username, reason: result.message });
    }
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('Authentication error', { error: error.message, stack: error.stack, username: req.body.username });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const logout = (logoutUsecase) => async (req: any, res: any) => {
  try {
    let user = req.user;
    let token = req.headers.authorization.replace('Bearer ', '');
    let result = await logoutUsecase(user, token, req, res);
    logger.info('User logged out', { userId: user.id });
    return responseHandler(res, result);
  } catch (error: any) {
    logger.error('Logout error', { error: error.message, userId: req.user ? req.user.id : 'unknown' });
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

export {
  register,
  forgotPassword,
  validateResetPasswordOtp,
  resetPassword,
  authentication,
  logout
};