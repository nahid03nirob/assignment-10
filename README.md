# RecipeHub

RecipeHub is a recipe discovery and sharing app with user dashboards, paid recipes, Premium membership, and admin moderation.

## Project structure
- `client/` - React and Vite web application
- `server/` - Express API, Better Auth, MongoDB persistence, and Stripe Checkout/webhooks

## Local development
1. Start MongoDB locally or create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `BETTER_AUTH_SECRET`, and the admin credentials.
3. Copy `client/.env.example` to `client/.env`.
4. Install dependencies with `npm --prefix client install` and `npm --prefix server install`.
5. Start the API with `npm --prefix server run dev` and the web app with `npm --prefix client run dev`.

The API waits for MongoDB, creates indexes, provisions the configured administrator, and seeds example recipes before it listens. It does not fall back to in-memory application data.

## Verification
- Client production build: `npm --prefix client run build`
- Client lint: `npm --prefix client run lint`
- Server tests: `npm --prefix server test`

## Production services
Configure MongoDB, a Stripe secret key and webhook signing secret, a strong Better Auth secret, the exact deployed client origin, and the deployed API base URL. Better Auth persists JWT/JWKS signing keys in MongoDB. Set Google OAuth credentials and register the callback `${BETTER_AUTH_BASE_URL}/api/auth/callback/google` in Google Cloud. Never commit `.env` files.
