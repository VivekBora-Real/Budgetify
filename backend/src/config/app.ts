import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from '../middleware/error.middleware';
import routes from '../routes';

const createApp = (): Application => {
  const app = express();
  
  // Trust proxy
  app.set('trust proxy', 1);
  
  // Security middleware
  app.use(helmet());
  
  // CORS configuration - Allow all origins
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
  }));
  
  // Compression middleware
  app.use(compression());
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use('/api', limiter);
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Handle preflight requests
  app.options('*', cors());
  
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
  
  // API routes
  app.use('/api', routes);
  
  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND'
      }
    });
  });
  
  // Error handling middleware (must be last)
  app.use(errorHandler);
  
  return app;
};

export default createApp;