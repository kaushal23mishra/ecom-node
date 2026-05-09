import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';
import logger from '../utils/logger';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5001),
  DB_URL: Joi.string().required(),
  DB_TEST_URL: Joi.string(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  ALLOW_ORIGIN: Joi.string().default('*'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'debug').default('info'),
  REDIS_URL: Joi.string(),
  MAILGUN_USER: Joi.string(),
  MAILGUN_PASSWORD: Joi.string(),
  SMS_USER_ID: Joi.string(),
  SMS_PASSWORD: Joi.string(),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  logger.error(`Environment validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: { url: envVars.NODE_ENV === 'test' ? envVars.DB_TEST_URL : envVars.DB_URL },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_EXPIRES_IN,
  },
  cors: { origin: envVars.ALLOW_ORIGIN },
  redis: { url: envVars.REDIS_URL },
  email: {
    user: envVars.MAILGUN_USER,
    password: envVars.MAILGUN_PASSWORD,
  },
  sms: {
    userId: envVars.SMS_USER_ID,
    password: envVars.SMS_PASSWORD,
  },
};

export default config;
export { config };

// For CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = config;
}
