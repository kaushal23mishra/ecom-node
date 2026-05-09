export {};
const NodeCache = require('node-cache');
const Redis = require('ioredis');
const logger = require('./logger');
const config = require('../config');

// Local in-memory fallback
const localCache = new NodeCache({
  stdTTL: 100,
  checkperiod: 120,
});

class CacheService {
  constructor () {
    this.redis = null;
    this.useRedis = false;

    if (config.redis && config.redis.url) {
      try {
        this.redis = new Redis(config.redis.url, {
          maxRetriesPerRequest: 3,
          retryStrategy (times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        this.redis.on('connect', () => {
          logger.info('Connected to Redis for caching');
          this.useRedis = true;
        });

        this.redis.on('error', (err) => {
          logger.error('Redis Cache Error', { error: err.message });
          this.useRedis = false;
        });
      } catch (error: any) {
        logger.error('Failed to initialize Redis client', { error: error.message });
      }
    } else {
      logger.info('Redis URL not found, using In-Memory cache (Not scalable horizontally)');
    }
  }

  /**
   * Get value from cache
   * @param {string} key
   */
  async get (key) {
    try {
      if (this.useRedis && this.redis) {
        const val = await this.redis.get(key);
        if (val) {
          logger.debug(`Redis HIT: ${key}`);
          return JSON.parse(val);
        }
      }
    } catch (error: any) {
      logger.warn('Redis GET failed, falling back to local', {
        key,
        error: error.message,
      });
    }

    const val = localCache.get(key);
    if (val) logger.debug(`Local HIT: ${key}`);
    return val;
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttl Seconds
   */
  async set (key, value, ttl = 60) {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        logger.debug(`Redis SET: ${key} (TTL: ${ttl}s)`);
        return;
      }
    } catch (error: any) {
      logger.warn('Redis SET failed, using local', {
        key,
        error: error.message,
      });
    }

    localCache.set(key, value, ttl);
    logger.debug(`Local SET: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Delete from cache
   * @param {string} key
   */
  async del (key) {
    try {
      if (this.useRedis && this.redis) {
        await this.redis.del(key);
      }
    } catch (err: any) {
      logger.warn('Redis DEL failed', { key });
    }
    localCache.del(key);
  }

  /**
   * Helper to get or set
   */
  async getOrSet (key, fetchFunction, ttl = 60) {
    const cached = await this.get(key);
    if (cached !== undefined && cached !== null) return cached;

    const fresh = await fetchFunction();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}

module.exports = new CacheService();
