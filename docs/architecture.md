# Phase 1 architecture

## Current runtime

The repository contains two independently started applications:

- `fe/`: Vite and React storefront. Route screens live in `src/pages`, shared presentation in `src/components`, and Redux Toolkit state/API logic in `src/app` and `src/features`.
- `be/`: Express REST API. `app.js` registers middleware and route modules; `server.js` connects to MongoDB before opening the HTTP listener. Mongoose schemas, controllers, routes, middleware, validators, and shared utilities live under `src/`.

The current code is JavaScript and JSX. This layout is being preserved during Phase 1 to avoid an unnecessary migration of existing working features. New modules can adopt TypeScript as the codebase is migrated in a later phase.

## Runtime boundaries

The browser uses `VITE_API_URL` (default `http://localhost:5000/api`) to reach the API. The API uses `CLIENT_URL` for cross-origin access and `MONGO_URI` for its database connection. Environment files are local-only and excluded from git. The API health endpoint reports readiness after startup has connected to MongoDB.

## API conventions

Existing route modules are mounted beneath `/api`; `/api/health` is the liveness/readiness endpoint. Route validation, authentication, response helpers, and centralized error handling are under `be/src/`. New domain behavior should place business logic in services and keep controllers focused on HTTP input/output.

## Next phases

Add missing service modules and split configuration as domains expand. Implement authentication and authorization before exposing admin operations, then develop catalog, inventory, cart, checkout, orders, and reporting against real persistence. TypeScript conversion and deployment hardening belong to later phases.
