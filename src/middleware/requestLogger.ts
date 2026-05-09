/**
 * Request Tracing Middleware
 * Generates correlation IDs and tracks request duration
 */
import { v4 as uuidv4 } from 'uuid';
import logger, { context } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

const requestLogger = (req: any, res: Response, next: NextFunction) => {
  // Generate correlation ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = requestId; // Standardize as req.id
  res.setHeader('x-request-id', requestId);

  // Initial state for thread-local storage
  const store = new Map<string, string>();
  store.set('requestId', requestId);
  if (req.user) {
    store.set('userId', req.user.id);
  }

  // Run next() within the context of the store
  context.run(store, () => {
    const start = Date.now();

    // Log request start
    logger.info(`Incoming ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      contentLength: req.get('content-length'),
    });

    // Log response on finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`Completed ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('content-length'),
      });
    });

    next();
  });
};

export default requestLogger;
