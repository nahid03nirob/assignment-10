import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { toNodeHandler } from 'better-auth/node';
import { env } from './env.js';
import { connectDatabase } from './database.js';
import auth, { connectAuthDatabase } from './betterAuth.js';
import mongoRouter, { handleStripeWebhook, seedMongoData } from './mongoRoutes.js';

const app = express();
const allowedOrigins = new Set([env.CLIENT_URL, ...env.CORS_ORIGINS.split(',')].map((origin) => origin.trim()).filter(Boolean));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.all('/api/auth/*', toNodeHandler(auth));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  handleStripeWebhook(req, res).catch(next);
});

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  timestamp: new Date().toISOString(),
}));

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return mongoRouter(req, res, next);
  return res.status(503).json({ message: 'Database is not available.' });
});
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message);
  return res.status(500).json({ message: 'The request could not be completed.' });
});

if (env.NODE_ENV !== 'test') {
  connectDatabase()
    .then(connectAuthDatabase)
    .then(seedMongoData)
    .then(() => {
      app.listen(env.PORT, () => console.log(`RecipeHub API listening on port ${env.PORT}`));
    })
    .catch((error) => {
      console.error('RecipeHub API startup failed:', error.message);
      process.exitCode = 1;
    });
}

export default app;