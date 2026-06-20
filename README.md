# RecipeHub — Recipe Sharing Platform

RecipeHub is a responsive recipe sharing platform for creating, browsing, purchasing, liking, reporting, and saving recipes. This client is built as a route-safe SPA so production refreshes do not break private or public routes when configured with the included redirect file.

## Live Features

- Home page with banner, CTA, featured recipes, popular recipes, and two static content sections.
- Browse recipes with category and cuisine filtering plus paginated cards.
- Recipe details with like, purchase, favorite, and report interactions.
- Login, register, Google login demo flow, intended-route redirect, and persistent auth state.
- User dashboard with overview, add recipe limit, favorites, purchased recipes, and profile update.
- Admin dashboard with users, recipes, reports, and transactions.
- Premium membership demo flow with transaction saving.
- Dark and light theme toggle.
- Loading state and custom 404 page.

## Demo Admin

- Email: `admin@recipehub.com`
- Password: `Admin123`

## Run Locally

Open `index.html` in a browser, or serve the folder with any static server.

```bash
npx serve .
```

## Production Routing

For Netlify, `_redirects` sends every route to `index.html`. For Vercel, use the included `vercel.json` rewrite.

## Server

The `server` folder contains the backend scaffold with Express, MongoDB, JWT HTTPOnly cookies, Better Auth environment configuration, Stripe checkout routes, protected dashboard APIs, admin APIs, reports, favorites, payments, and server-side pagination.
