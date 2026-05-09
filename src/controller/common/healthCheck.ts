/**
 * healthCheck.js
 * @description :: Health check routes for monitoring
 */

const mongoose = require('mongoose');
const os = require('os');
const asyncHandler = require('../../utils/asyncHandler');
const { AppError } = require('../../utils/AppError');
const ERROR_CODES = require('../../constants/errorCodes');

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Monitoring
 *     summary: Basic health check
 *     description: Returns the status of the application and basic environment info.
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *       503:
 *         description: Application is unhealthy
 */
const healthCheck = asyncHandler(async (req: any, res: any) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../../package.json').version,
  };

  res.status(200).json(healthData);
});

/**
 * @route GET /health/detailed
 * @description Detailed health check with system metrics and database connectivity
 */
const detailedHealthCheck = asyncHandler(async (req: any, res: any) => {
  // 1. Check database connection & latency
  const startDb = Date.now();
  let dbStatus = 'connected';
  let dbLatency = 0;

  try {
    if (mongoose.connection.readyState !== 1) {
      dbStatus = 'disconnected';
    } else {
      // Real ping to database
      await mongoose.connection.db.admin().ping();
      dbLatency = Date.now() - startDb;
    }
  } catch (error: any) {
    dbStatus = 'error';
  }

  // 2. System Metrics
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const systemUptime = os.uptime();
  const processUptime = process.uptime();

  const healthData = {
    status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: processUptime,
    checks: {
      database: {
        status: dbStatus,
        type: 'MongoDB',
        responseTime: `${dbLatency}ms`
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
        loadAverage: os.loadavg(),
        uptime: `${Math.floor(systemUptime)}s`
      }
    },
    environment: process.env.NODE_ENV || 'development',
    version: require('../../../package.json').version
  };

  if (dbStatus !== 'connected') {
    throw new AppError('Detailed health check failed: Database not reachable', 503, ERROR_CODES.DB_CONNECTION_ERROR);
  }

  res.status(200).json(healthData);
});

/**
 * @route GET /health/ready
 * @description Readiness probe for Kubernetes/Docker
 */
const readinessCheck = asyncHandler(async (req: any, res: any) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (!dbReady) {
    throw new AppError('Database not connected', 503, ERROR_CODES.DB_CONNECTION_ERROR);
  }

  res.status(200).json({
    status: 'READY',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /health/live
 * @description Liveness probe for Kubernetes/Docker
 */
const livenessCheck = (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString()
  });
};

export = {
  healthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck
};
