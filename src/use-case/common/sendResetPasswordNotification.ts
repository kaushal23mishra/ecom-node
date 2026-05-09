const dayjs = require('dayjs');
const uuid = require('uuid').v4;
const ejs = require('ejs');
const { FORGOT_PASSWORD_WITH } = require('../../constants/authConstant');
const response = require('../../utils/response');

const { sendMail } = require('../../services/email');
const { sendSMS } = require('../../services/sms');

const logger = require('../../utils/logger');

const sendResetPasswordNotification =
  ({ userDb }: any) =>
  async (user: any) => {
    let resultOfEmail = false;
    let resultOfSMS = false;
    let token = uuid();
    let expires = dayjs();
    expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRE_TIME, 'minute').toISOString();
    await userDb.updateOne(
      {
        _id: user.id,
        isActive: true,
        isDeleted: false,
      },
      {
        resetPasswordLink: {
          code: token,
          expireTime: expires,
        },
      }
    );
    if (FORGOT_PASSWORD_WITH.LINK.email) {
      let mailObj: any = {
        subject: 'Reset Password',
        to: user.email,
      };
      let viewType = '/reset-password/';
      mailObj.template = '/views/email/ResetPassword';
      mailObj.data = {
        userName: user.username || '-',
        link: `http://localhost:${process.env.PORT}` + viewType + token,
        linkText: 'Reset Password',
      };
      try {
        await sendMail(mailObj);
        resultOfEmail = true;
      } catch (error: any) {
        logger.error('Error sending reset password email', {
          error: error.message,
          userId: user.id,
        });
      }
    }
    if (FORGOT_PASSWORD_WITH.LINK.sms) {
      let viewType = '/reset-password/';
      let link = `http://localhost:${process.env.PORT}${viewType + token}`;
      const msg = await ejs.renderFile(`${process.cwd()}/views/sms/ResetPassword/html.ejs`, {
        link: link,
      });
      let smsObj = {
        to: user.mobileNo,
        message: msg,
      };
      try {
        await sendSMS(smsObj);
        resultOfSMS = true;
      } catch (error: any) {
        logger.error('Error sending reset password SMS', {
          error: error.message,
          userId: user.id,
        });
      }
    }
    return response.success({
      data: {
        resultOfEmail,
        resultOfSMS,
      },
    });
  };

export = sendResetPasswordNotification;
