import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import consumerRoutes from './routes/consumer';
import providerRoutes from './routes/provider';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import bookingRoutes from './routes/bookings';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Compression
app.use(compression());

// CORS
app.use(cors({ origin: env.corsOrigin }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.nodeEnv?.trim() === 'development') {
  app.use(morgan('dev'));
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

import { execSync } from 'child_process';
app.get('/api/git-history', (req, res) => {
  try {
    const log = execSync('git log -p d:/localconnect/my-professional-app/app/consumer/src/screens/2_servicesScreen.tsx', { maxBuffer: 1024 * 1024 * 10 }).toString();
    res.send(log);
  } catch (e: any) {
    res.send('ERROR: ' + e.toString());
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found', status: 404 },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
