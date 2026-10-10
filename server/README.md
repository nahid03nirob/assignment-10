# RecipeHub API

Express API with Better Auth sessions, Google OAuth, MongoDB persistence, and Stripe Checkout.

## Setup
Copy `.env.example` to `.env`. Configure MongoDB and a strong `BETTER_AUTH_SECRET`. `ADMIN_EMAIL` and `ADMIN_PASSWORD` provision the administrator through Better Auth on startup. Start MongoDB before running the server.

```sh
npm install
npm run dev
```

The server creates MongoDB indexes and seeds example recipes before accepting requests. All user, recipe, favorite, like, report, payment, purchase, and webhook-event records are persisted in MongoDB. Startup fails if MongoDB is unavailable or `MONGODB_URI` is missing.

## Authentication and OAuth
Better Auth owns email/password, Google OAuth, session cookies, and JWT/JWKS endpoints. Its JWT signing keys are persisted in MongoDB. The session cookie is HTTPOnly; production cookies require HTTPS. The app's admin role, block state, and Premium state are read from the server-side user collection and are never accepted from client input. Configure the Google callback as `${BETTER_AUTH_BASE_URL}/api/auth/callback/google`.

## Payments
Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Register `${BETTER_AUTH_BASE_URL}/api/payments/webhook` as a Stripe webhook endpoint and subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. The API grants purchases or Premium only after retrieving/verifying paid session details or validating Stripe's webhook signature.

## Tests
```sh
npm test
```
The integration suite starts a disposable MongoDB instance and verifies persistence across reconnects, authentication, recipe limits, entitlements, and signed Stripe webhook fulfillment. The MongoDB test binary is downloaded on first run. Set `MONGODB_TEST_URI` to use an existing disposable database instead.
