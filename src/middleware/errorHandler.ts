import {
  Request, Response, NextFunction 
} from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';
import ERROR_CODES from '../constants/errorCodes';

/**
 * Global error handler middleware
 * Handles all operational errors and catches unhandled bugs
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error
  (logger as any).logError(err, req);

  // 1. Handle Invalid Object ID (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, ERROR_CODES.BAD_REQUEST);
  }

  // 2. Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR);
    error.errors = err.errors;
  }

  // 3. Handle Duplicate Key Error
  if (err.code === 11000) {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const value = match ? match[0] : 'Unknown';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    error = new AppError(message, 400, ERROR_CODES.DUPLICATE_KEY);
  }

  // 4. Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again!', 401, ERROR_CODES.INVALID_TOKEN);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired! Please log in again.', 401, ERROR_CODES.TOKEN_EXPIRED);
  }

  // Send Error Response
  sendError(error, req, res);
};

const sendError = (err: any, req: any, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'ERROR',
      code: err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
      requestId: req.id, // Traceable error ID
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.errors && { errors: err.errors })
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error('Unhandled Programming Error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl
  });

  return res.status(500).json({
    status: 'ERROR',
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
