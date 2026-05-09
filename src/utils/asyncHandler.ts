export {};
/**
 * Async handler convenience wrapper
 * Removes the need for try-catch blocks in controllers
 * 
 * @param {Function} fn - Controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
