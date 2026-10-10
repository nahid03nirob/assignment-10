import mongoose from 'mongoose';
import { env } from './env.js';
import { Favorite, Like, Payment, Purchase, Recipe, Report, User, WebhookEvent } from './models.js';

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured before starting the API.');
  }

  await mongoose.connect(env.MONGODB_URI, { dbName: env.DB_NAME });
  await Promise.all([
    User.init(),
    Recipe.init(),
    Favorite.init(),
    Like.init(),
    Report.init(),
    Payment.init(),
    Purchase.init(),
    WebhookEvent.init(),
  ]);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}