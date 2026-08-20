import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { getPool } from './config/database.js';
import { logger, stream } from './config/logger.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import rsvpRoutes from './routes/rsvpRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/error.js';
import { testConnection } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('combined', { stream }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || 5),
  message: { message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', rsvpRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    const pool = await getPool();
    app.set('dbPool', pool);

    app.listen(PORT, () => {
      logger.info(`EventHive backend server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
