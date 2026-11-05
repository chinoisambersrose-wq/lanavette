import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { openApiSpec } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { adminRouter } from './routes/admin/index.js';
import { authRouter } from './routes/auth.routes.js';
import { citiesRouter } from './routes/cities.routes.js';
import { formulasRouter } from './routes/formulas.routes.js';
import { healthRouter } from './routes/health.js';
import { sessionsRouter } from './routes/sessions.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [env.APP_ORIGIN, env.VITRINE_ORIGIN],
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });
  app.use('/api/v1/auth', authLimiter);

  if (env.NODE_ENV !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  }

  app.use('/api/v1', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1', formulasRouter);
  app.use('/api/v1', citiesRouter);
  app.use('/api/v1', sessionsRouter);
  app.use('/api/v1/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
