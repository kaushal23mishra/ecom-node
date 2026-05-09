export {};
/**
 * apiVersion.js
 * @description :: Middleware to handle API versioning via headers or query parameters
 */

export default (req, res, next) => {
    // 1. Check for version in headers
    const headerVersion = req.headers['api-version'] || req.headers['x-api-version'];

    // 2. Check for version in query parameters
    const queryVersion = req.query.version;

    // 3. Fallback to default v1
    const version = headerVersion || queryVersion || 'v1';

    // Attach to request object
    req.apiVersion = version;

    // Optionally set in response header for clarity
    res.setHeader('X-API-Version', version);

    next();
};
