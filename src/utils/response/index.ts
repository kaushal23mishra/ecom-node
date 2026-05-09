import { Response } from 'express';
import logger from '../logger';

export const RESPONSE_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  SERVER_ERROR: 'SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
};

export const RESPONSE_CODE = {
  success: 200,
  badRequest: 400,
  unAuthorized: 401,
  forbidden: 403,
  notFound: 404,
  validationError: 422,
  internalServerError: 500,
};

export const response = {
  success: (data: any = {}) => ({
    status: RESPONSE_STATUS.SUCCESS,
    message: data.message || 'Your request is successfully executed',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  failure: (data: any = {}) => ({
    status: RESPONSE_STATUS.FAILURE,
    message: data.message || 'Some error occurred while performing action.',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  internalServerError: (data: any = {}) => ({
    status: RESPONSE_STATUS.SERVER_ERROR,
    message: data.message || 'Internal server error.',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  badRequest: (data: any = {}) => ({
    status: RESPONSE_STATUS.BAD_REQUEST,
    message: data.message || 'The request cannot be fulfilled due to bad syntax.',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  recordNotFound: (data: any = {}) => ({
    status: RESPONSE_STATUS.RECORD_NOT_FOUND,
    message: data.message || 'Record(s) not found with specified criteria.',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  validationError: (data: any = {}) => ({
    status: RESPONSE_STATUS.VALIDATION_ERROR,
    message: data.message || `Invalid Data, Validation Failed.`,
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
  unAuthorized: (data: any = {}) => ({
    status: RESPONSE_STATUS.UNAUTHORIZED,
    message: data.message || 'You are not authorized to access the request',
    data: data.data && Object.keys(data.data).length ? data.data : null,
  }),
};

export const responseHandler = (res: Response, body: any = {}) => {
  const headers = body.headers || { 'Content-Type': 'application/json' };
  let statusCode: number;

  switch (body.status) {
  case RESPONSE_STATUS.SUCCESS: statusCode = body.statusCode || RESPONSE_CODE.success; break;
  case RESPONSE_STATUS.FAILURE: statusCode = body.statusCode || RESPONSE_CODE.success; break;
  case RESPONSE_STATUS.SERVER_ERROR: statusCode = body.statusCode || RESPONSE_CODE.internalServerError; break;
  case RESPONSE_STATUS.BAD_REQUEST: statusCode = body.statusCode || RESPONSE_CODE.badRequest; break;
  case RESPONSE_STATUS.RECORD_NOT_FOUND: statusCode = body.statusCode || RESPONSE_CODE.notFound; break;
  case RESPONSE_STATUS.VALIDATION_ERROR: statusCode = body.statusCode || RESPONSE_CODE.validationError; break;
  case RESPONSE_STATUS.UNAUTHORIZED: statusCode = body.statusCode || RESPONSE_CODE.unAuthorized; break;
  default: statusCode = body.statusCode || RESPONSE_CODE.internalServerError;
  }

  if ((res.req as any)?.id) body.requestId = (res.req as any).id;
  return res.set(headers).status(statusCode).send(body);
};

export default response;

// For CommonJS compatibility
if (typeof module !== 'undefined') {
  const cjsResponse = { ...response };
  (cjsResponse as any).responseHandler = responseHandler;
  (cjsResponse as any).RESPONSE_STATUS = RESPONSE_STATUS;
  (cjsResponse as any).RESPONSE_CODE = RESPONSE_CODE;
  module.exports = cjsResponse;
}
