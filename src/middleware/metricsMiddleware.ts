export {};
/**
 * Middleware to collect Prometheus metrics for each request
 */
const {
  httpRequestDurationMicroseconds, httpRequestsTotal 
} = require('../utils/metrics');

/**
 * Normalizes routes to prevent high cardinality
 * e.g., /users/123 -> /users/:id
 */
const normalizePath = (req) => {
  const path = req.route ? req.route.path : req.path;
  return path || 'unknown';
};

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = normalizePath(req);
    const method = req.method;
    const code = res.statusCode;

    // Observe duration
    httpRequestDurationMicroseconds
      .labels(method, route, code)
      .observe(durationInSeconds);

    // Increment request counter
    httpRequestsTotal
      .labels(method, route, code)
      .inc();
  });

  next();
};

export default metricsMiddleware;
