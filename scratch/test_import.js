const asyncHandler = require('../src/utils/asyncHandler');
console.log('Type of asyncHandler:', typeof asyncHandler);
if (typeof asyncHandler === 'function') {
  console.log('SUCCESS: asyncHandler is a function');
} else {
  console.log('FAILURE: asyncHandler is not a function', asyncHandler);
}
