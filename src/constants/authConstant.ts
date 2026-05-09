/**
 * authConstant.js
 * @description :: constants used in authentication
 */

export const JWT = {
  ADMIN_SECRET:'myjwtadminsecret',
  DEVICE_SECRET:'myjwtdevicesecret',
  CLIENT_SECRET:'myjwtclientsecret',
  EXPIRES_IN: 10000
};

export const USER_TYPES = {
  User:1,
  Admin:2,
};

export const PLATFORM = {
  ADMIN:1,
  DEVICE:2,
  CLIENT:3,
};

export const LOGIN_ACCESS = {
  [USER_TYPES.Admin]:[PLATFORM.ADMIN],           
  [USER_TYPES.User]:[PLATFORM.DEVICE,PLATFORM.CLIENT],           
};

export const MAX_LOGIN_RETRY_LIMIT = 3;
export const LOGIN_REACTIVE_TIME = 2;
    
export const FORGOT_PASSWORD_WITH = {
  LINK: {
    email: true,
    sms: false
  },
  EXPIRE_TIME: 20
};

export {};