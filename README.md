# ShopNest

ShopNest is a React storefront and Express API backed by MongoDB. The current codebase implements customer and admin authentication, catalog management, product browsing, customer cart/wishlist/addresses, COD checkout, coupon validation, newsletter subscriptions, review moderation, inventory movements, customer administration, and sales reports.

## Requirements

- Node.js 20.19+ or 22.12+ (required by the installed Vite 8 release)
- npm
- MongoDB running locally, or a MongoDB connection URI

## Configure and run

1. Copy `be/.env.example` to `be/.env`, then set `MONGO_URI`, a private `JWT_SECRET`, SMTP settings for email verification and password reset, and Cloudinary credentials for image uploads. During local development, account links are printed to the backend console if SMTP is not configured.
2. Copy `fe/.env.example` to `fe/.env` (the default points to the local API).
3. Install dependencies and start each app in separate terminals:

```powershell
cd be
npm install
npm run dev
```

```powershell
cd fe
npm install
npm run dev
```

The API is available at `http://localhost:5000`, its health endpoint is `http://localhost:5000/api/health`, and Vite serves the storefront at `http://localhost:5173`. The API waits for MongoDB before accepting requests. Set `PORT`, `MONGO_URI`, `CLIENT_URL`, and `VITE_API_URL` in the respective environment files to change local settings. Never commit `.env` files or real credentials.

## Repository layout

```text
be/                         Express API and Mongoose application
  src/config/               Database and runtime configuration
  src/controllers/          HTTP request handlers
  src/models/               Mongoose schemas
  src/routes/               REST route modules
  src/services/             Mail and provider integrations
  src/middleware/           Authentication and error middleware
  src/validators/           Request validation
  src/utils/                Shared helpers and seed data
fe/                         Vite and React storefront
  src/app/                  Redux store and API base
  src/components/           Reusable UI components
  src/features/             Feature state and API modules
  src/layouts/               Customer and admin layouts
  src/pages/                 Route-level screens
  src/routes/                Route configuration
  src/services/              Shared API services
docs/                       Architecture and API notes
```

The current application uses JavaScript/JSX. TypeScript migration remains outstanding.

## AI Concierge

The API exposes `POST /api/ai/chat` behind JWT authentication. To enable a provider, configure either `OPENAI_ENABLED=true` with `OPENAI_API_KEY`, or `GEMINI_ENABLED=true` with `GOOGLE_API_KEY`, in `be/.env`. Without a provider key, the local grounded response path remains available.

## Development phases

Phases 1–11 cover the runnable project foundation, authentication, catalog and browsing, customer cart/wishlist/addresses, checkout foundations, admin operations, customer reports, coupons, newsletter subscriptions, and CMS banners/pages. COD checkout is implemented; Stripe payments, webhook verification, refunds, transaction-based order/stock operations, and TypeScript migration remain outstanding. See the phase notes in `docs/`. Seed credentials use `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_ROLE` (`admin` or `superadmin`), and `SEED_SAMPLE_CUSTOMER_PASSWORD`. The seed script clears core development collections, so only run it against a disposable development database.
