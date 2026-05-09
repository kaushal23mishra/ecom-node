export {};
const {
  Queue, Worker 
} = require('bullmq');
const Redis = require('ioredis');
const logger = require('./logger');
const config = require('../config');

class QueueService {
  constructor () {
    this.queues = {};
    this.connection = null;

    if (config.redis && config.redis.url) {
      this.connection = new Redis(config.redis.url, { maxRetriesPerRequest: null }); // Required for BullMQ
      logger.info('Queue Service initialized with Redis');
    } else {
      logger.warn('Redis not configured. Queue Service will not work.');
    }
  }

  /**
   * Get or create a queue
   * @param {string} name
   */
  getQueue (name) {
    if (!this.connection) return null;
    if (!this.queues[name]) {
      this.queues[name] = new Queue(name, { connection: this.connection });
    }
    return this.queues[name];
  }

  /**
   * Add a job to a queue
   * @param {string} queueName
   * @param {string} jobName
   * @param {object} data
   * @param {object} options
   */
  async addJob (queueName, jobName, data, options = {}) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      logger.error(`Cannot add job: Queue ${queueName} not available`);
      return null;
    }
    const job = await queue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      ...options,
    });
    logger.debug(`Job added to ${queueName}: ${job.id}`);
    return job;
  }

  /**
   * Create a worker for a queue
   * @param {string} queueName
   * @param {function} processor
   */
  createWorker (queueName, processor) {
    if (!this.connection) return null;
    const worker = new Worker(queueName, processor, { connection: this.connection });

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} in ${queueName} completed`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job ${job.id} in ${queueName} failed`, { error: err.message });
    });

    return worker;
  }
}

module.exports = new QueueService();
