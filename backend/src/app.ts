import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sanitizeInputs } from './middlewares/security.js';
import apiV1Routes from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // 1. Security Headers (Defend against Clickjacking, MIME sniffing, XSS, and Information Disclosure)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      frameguard: { action: 'deny' }, // Anti-clickjacking
      noSniff: true, // X-Content-Type-Options: nosniff
      xssFilter: true, // X-XSS-Protection
      hidePoweredBy: true, // Remove X-Powered-By
      hsts: { maxAge: 31536000, includeSubDomains: true }, // Strict Transport Security
    })
  );

  // 2. CORS Allowlist
  const allowedOrigins = [
    env.FRONTEND_URL,
    env.ADMIN_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Rate Limiting
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', generalLimiter);

  // 4. Request Logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url?.includes('/health') || req.method === 'OPTIONS',
      },
    })
  );

  // 5. Body Parsers & Cookie Parser
  // Keep raw body for webhook signature verification; limit JSON payload to 2mb to block memory DoS
  app.use(
    express.json({
      limit: '2mb',
      verify: (req: any, res, buf) => {
        if (req.originalUrl?.includes('/webhooks')) {
          req.rawBody = buf;
        }
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Deep recursive sanitization against XSS, script injection, and Prototype Pollution
  app.use(sanitizeInputs);

  // 6. Static files (logo and videos in workspace root)
  const workspaceRoot = path.resolve(process.cwd(), '..');
  app.use(express.static(workspaceRoot));

  // 7. Root Welcome & Health Check
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      service: 'GymNation API Server',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      links: {
        storefront: 'http://localhost:3000',
        adminPanel: 'http://localhost:3001',
        apiV1: '/api/v1',
        health: '/api/v1/health',
      },
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      service: 'GymNation API Server',
      status: 'operational',
      timestamp: new Date().toISOString(),
    });
  });

  // Dedicated /admin endpoint for direct access & deployment routing
  app.get('/admin', (req, res) => {
    const adminUrl = env.ADMIN_URL || 'http://localhost:3001';
    if (req.headers.accept?.includes('text/html')) {
      return res.redirect(adminUrl);
    }
    return res.json({
      success: true,
      service: 'GymNation Management Console',
      adminPanelUrl: adminUrl,
      loginUrl: `${adminUrl}/login`,
      apiBase: '/api/v1',
      adminAuthEndpoint: '/api/v1/admin/auth/login',
      status: 'operational',
    });
  });

  // 8. API Routes
  app.use('/api/v1', apiV1Routes);

  // 9. 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    });
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
