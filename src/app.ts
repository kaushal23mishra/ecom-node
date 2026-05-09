import express, {
  Request, Response, NextFunction 
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean'); // No types available usually
import hpp from 'hpp';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
const listEndpoints = require('express-list-endpoints');
import morgan from 'morgan';
import passport from 'passport';
import mongoose from './db/mongoDB/connection';

dotenv.config();

import logger from './utils/logger';
import {
  adminPassportStrategy, errorHandler, apiVersion 
} from './middleware';
import { devicePassportStrategy } from './middleware';
import { clientPassportStrategy } from './middleware';
import requestLogger from './middleware/requestLogger';
import { register } from './utils/metrics';
import metricsMiddleware from './middleware/metricsMiddleware';
import healthCheckController from './controller/common/healthCheck';
import routes from './routes';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerConfig from './config/swagger';

const app = express();

// Middleware: Request Tracing
app.use(requestLogger);

// Middleware: API Versioning
app.use(apiVersion);

// Middleware: Prometheus Metrics
app.use(metricsMiddleware);

// Endpoint: Prometheus Metrics
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc: ['\'self\'', 'data:', 'https://dxuoui1db8w1y.cloudfront.net'],
      scriptSrc: ['\'self\'', '\'unsafe-inline\''],
    },
  },
}));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

const corsOptions = { origin: process.env.ALLOW_ORIGIN };
app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check routes
app.get('/health', healthCheckController.healthCheck);
app.get('/health/detailed', healthCheckController.detailedHealthCheck);
app.get('/health/ready', healthCheckController.readinessCheck);
app.get('/health/live', healthCheckController.livenessCheck);

// Passport strategies
adminPassportStrategy(passport);
devicePassportStrategy(passport);
clientPassportStrategy(passport);

app.use(morgan('combined', { stream: (logger as any).stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: false,
  limit: '10mb' 
}));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(routes);

// Global error handler
app.use(errorHandler);

const swaggerSpecs = swaggerJsDoc(swaggerConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.get('/api-docs-json', (req: Request, res: Response) => res.json(swaggerSpecs));
app.get('/swagger', (req: Request, res: Response) => res.redirect('/api-docs'));

app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

if (process.env.NODE_ENV !== 'test') {
  const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/node_dhi';
  (mongoose as any).connectDB(dbUrl).then(() => {
    const seeder = require('./seeders');
    const allRegisterRoutes = listEndpoints(app);
    seeder(allRegisterRoutes).then(() => {
      logger.info('✅ Database seeding completed');
    });
    app.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on port ${process.env.PORT}`);
    });
  });
}

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection at:', { reason: reason.message || reason });
});

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception thrown', {
    error: err.message,
    stack: err.stack 
  });
  process.exit(1);
});

export default app;
module.exports = app;