/**
 * metrics.js
 * @description :: Prometheus metrics configuration
 */

const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'node-dhi'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Define custom metrics

/**
 * Histogram for tracking request duration
 * LABELS: method, route, code
 */
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

/**
 * Counter for total requests
 * LABELS: method, route, code
 */
const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

/**
 * Counter for total errors
 * LABELS: method, route, error_code
 */
const httpErrorsTotal = new client.Counter({
    name: 'http_errors_total',
    help: 'Total number of HTTP errors',
    labelNames: ['method', 'route', 'error_code']
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);

export {
    register,
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    httpErrorsTotal
};
