const response = require('../../utils/response');
const dayjs = require('dayjs');

/**
 * @description : validate OTP for reset password.
 * @param {Object} params : request body.
 * @return {Object} : response for validateResetPasswordOtp {status, message, data}
 */
const validateResetPasswordOtp =
  ({ userDb }: any) =>
    async (params: any) => {
      if (!params.otp) {
        return response.badRequest({ message: 'Insufficient request parameters! otp is required.' });
      }
      let where: any = { 'resetPasswordLink.code': params.otp };
      where.isActive = true;
      where.isDeleted = false;

      let user = await userDb.findOne(where);
      if (user) {
        if (dayjs(user.resetPasswordLink.expireTime).isBefore(dayjs())) {
          return response.badRequest({ message: 'Your reset password link is expired.' });
        }
        return response.success({ message: 'OTP Validated' });
      }
      return response.badRequest({ message: 'Invalid OTP' });
    };

export = validateResetPasswordOtp;
