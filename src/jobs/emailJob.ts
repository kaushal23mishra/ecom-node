export {};
const queueService = require('../utils/queue');
const logger = require('../utils/logger');

/**
 * Example Worker for Email Processing
 */
const emailWorker = queueService.createWorker('email-queue', async (job) => {
  const {
    to, subject, body 
  } = job.data;

  logger.info(`Processing email to ${to}`, { subject });

  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 2000));

  logger.info(`Email sent to ${to}`);
});

module.exports = { emailWorker, };
