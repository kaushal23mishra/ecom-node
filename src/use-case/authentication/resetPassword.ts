const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const response = require('../../utils/response');

/**
 * @description : reset password with code and new password.
 * @param {Object} params : request body.
 * @return {Object} : response for resetPassword {status, message, data}
 */ 
const resetPassword = ({ userDb }: any) => async (params: any) => {
  if (!params.newPassword || !params.code) {
    return response.badRequest({ message : 'Insufficient request parameters! newPassword and code is required.' });
  }
  let where: any = { 'resetPasswordLink.code': params.code };
  where.isActive = true;
  where.isDeleted = false;
  
  let user = await userDb.findOne(where);
  if (user) {
    if (dayjs(user.resetPasswordLink.expireTime).isBefore(dayjs())) {
      return response.badRequest({ message:'Your reset password link is expired.' });
    }
    let newPassword = await bcrypt.hash(params.newPassword, 8);
    await userDb.updateOne({ _id: user.id }, {
      password: newPassword,
      resetPasswordLink: {},
      loginRetryLimit: 0,
      loginReactiveTime: null,
    });
    return response.success({ message :'Password reset successfully' });
  }
  return response.badRequest({ message :'Invalid Code' });
};

export = resetPassword;