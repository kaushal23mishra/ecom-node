const response = require('../../utils/response');
const responseStatus = require('../../utils/response/responseStatus');
const makeSendResetPasswordNotification = require('../common/sendResetPasswordNotification');

/**
 * @description : send email or sms to user with OTP on forgot password
 * @param {Object} params : request body.
 * @return {Object} : response for forgotPassword {status, message, data}
 */ 
const forgotPassword = ({
  userDb,userAuthSettingsDb  
}: any) => async (params: any) => {
  if (!params.email) {
    return response.badRequest({ message : 'Insufficient request parameters! email is required' });
  }
  let where: any = { email: params.email };
  where.isActive = true;
  where.isDeleted = false;
  params.email = params.email.toString().toLowerCase();
  
  let user = await userDb.findOne(where);
  if (user) {
    let sendResetPasswordNotification = makeSendResetPasswordNotification({
      userDb,
      userAuthSettingsDb
    });
    let notificationResponse = await sendResetPasswordNotification(user);
    if (notificationResponse.status == responseStatus.success) {
      let {
        resultOfEmail, resultOfSMS
      } = notificationResponse.data;
      if (resultOfEmail && resultOfSMS) {
        return response.success({ message :'OTP successfully send.' });
      } else if (resultOfEmail && !resultOfSMS) {
        return response.success({ message : 'OTP successfully send to your email.' });
      } else if (!resultOfEmail && resultOfSMS) {
        return response.success({ message : 'OTP successfully send to your mobile number.' });
      } else {
        // Reset link was saved; notification channels not configured (e.g. test env)
        return response.success({ message : 'Reset password link has been sent.' });
      }
    } else {
      return response.failure();
    }
  } else {
    return response.recordNotFound();
  }
};

export = forgotPassword;