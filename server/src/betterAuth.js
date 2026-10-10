import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { jwt } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { env } from './env.js';

const mongoClient = new MongoClient(env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recipehub');
const trustedOrigins = [env.CLIENT_URL, ...env.CORS_ORIGINS.split(',')].map((origin) => origin.trim()).filter(Boolean);

export const auth = betterAuth({
  appName: 'RecipeHub',
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_BASE_URL,
  database: mongodbAdapter(mongoClient.db(env.DB_NAME), { client: mongoClient, transaction: false }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  } : {},
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      isBlocked: { type: 'boolean', defaultValue: false, input: false },
      isPremium: { type: 'boolean', defaultValue: false, input: false },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: env.NODE_ENV === 'production',
    },
  },
  plugins: [jwt()],
});

export async function connectAuthDatabase() {
  await mongoClient.connect();
}

export async function disconnectAuthDatabase() {
  await mongoClient.close();
}

export default auth;
