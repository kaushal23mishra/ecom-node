import {
  Request, Response, NextFunction 
} from 'express';
import {
  AnyZodObject, ZodError 
} from 'zod';
import response from '../utils/response';
const responseHandler = require('../utils/response/responseHandler');

export const validate =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        const issues = error.issues || error.errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')} : ${e.message}`).join(', ');
        return responseHandler(res, response.validationError({ message }));
      }
      console.error('Validation Middleware Error:', error);
      return responseHandler(
        res,
        response.internalServerError({ message: error.message || 'Validation failed' })
      );
    }
  };
