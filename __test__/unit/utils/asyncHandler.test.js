const asyncHandler = require('../../../src/utils/asyncHandler');

describe('Utils: asyncHandler', () => {
  it('should call the wrapped function and handle success', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const fn = jest.fn().mockResolvedValue('success');
    const wrapped = asyncHandler(fn);

    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and call next', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const error = new Error('Async Fail');

    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(fn);

    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
