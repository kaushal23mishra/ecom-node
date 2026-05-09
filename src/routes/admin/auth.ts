import express from 'express';
const router = express.Router();
import { auth } from '../../middleware';
import { validate } from '../../middleware/validate';
import {
  loginSchema, registerSchema 
} from '../../validation/schema/auth.schema';
import authController from '../../controller/admin/authentication';
import { PLATFORM } from '../../constants/authConstant';

router.route('/register').post(validate(registerSchema), authController.register);
router.route('/login').post(validate(loginSchema), authController.authentication);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/validate-otp').post(authController.validateResetPasswordOtp);
router.route('/reset-password').put(authController.resetPassword);
router.route('/logout').post(auth(PLATFORM.ADMIN), authController.logout);

export default router;
