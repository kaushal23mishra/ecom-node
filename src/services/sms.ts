export {};
const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

const sendSMS = async (obj) => {
  logger.info('Initiating SMS sending', { to: obj.to || obj.mobiles });

  if (obj.to) {
    obj.mobiles = obj.to;
  }
  let mobiles;
  if (Array.isArray(obj.mobiles)) {
    obj.mobiles = obj.mobiles.map((m) => {
      let tmpNo = m.split('+');
      return tmpNo[1] ? tmpNo[1] : tmpNo[0];
    });
    mobiles = obj.mobiles.join(',');
  } else {
    let tmpNo = obj.mobiles.split('+');
    mobiles = tmpNo[1] ? tmpNo[1] : tmpNo[0];
  }

  const message = obj.message;
  const userid = config.sms.userId;
  const password = config.sms.password;
  const v = 1.1;
  const method = 'sendMessage';
  const msg_type = 'text';
  const send_to = mobiles;

  if (!userid || !password) {
    logger.warn('SMS service requested but credentials missing in config');
    return {
      status: 'FAILURE',
      message: 'SMS credentials missing',
    };
  }

  try {
    const response = await axios({
      url: `http://enterprise.smsgupshup.com/GatewayAPI/rest?msg=${message}&v=${v}&userid=${userid}&password=${password}&method=${method}&send_to=${send_to}&msg_type=${msg_type}`,
      method: 'GET',
    });

    let responseData = response.data.split('|');
    if (responseData.length && responseData[0].trim() === 'error') {
      logger.error('SMS Provider returned error', { error: response.data });
      throw new Error(response.data);
    }

    logger.info('SMS sent successfully', { to: mobiles });
    return response;
  } catch (error: any) {
    logger.error('SMS sending failed', {
      error: error.message,
      to: mobiles,
    });
    throw error;
  }
};

module.exports = { sendSMS };
