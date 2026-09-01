# Red.Bank API

The Red.Bank API is the Express and MongoDB backend for the blood donation platform. It owns authentication sessions, authorization, donation-request state transitions, blog publication, payment intents, Stripe webhook processing, and public read models.

## Responsibilities

- Verify Firebase ID tokens server-side
- Issue and rotate HTTP-only JWT session cookies
- Enforce role, ownership, and account-status authorization
- Manage users, donation requests, blogs, and funding records
- Validate request bodies and protect state-changing requests with CSRF tokens
- Process Stripe PaymentIntent webhooks idempotently
- Expose health information for deployment monitoring

## Technology

- Node.js 20+
- Express 4
- MongoDB with Mongoose
- Firebase Admin SDK
- JSON Web Tokens
- Stripe
- Zod
- Helmet, CORS, compression, Morgan, and express-rate-limit

## Requirements

- Node.js 20 or newer
- npm
- MongoDB database
- Firebase project and service-account credentials
- Stripe account with webhook configuration
- A frontend origin configured in `ORIGIN`

## Local Setup

From this directory:

```bash
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The local API listens on the configured `PORT`, `5000` by default.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port |
| `MONGO_DB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access-token signing secret |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret |
| `FIREBASE_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service-account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key; preserve escaped newlines in `.env` |
| `ORIGIN` | Exact allowed frontend origin |
| `STRIPE_SECRET_KEY` | Stripe server secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NODE_ENV` | `development` or `production` |

Generate strong JWT secrets. Never commit `.env`, service-account credentials, database credentials, or Stripe secrets. The Firebase Admin variables are server-only and must never be placed in the client environment.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API for a traditional server deployment |
| `npm run lint` | Run ESLint across the server and configuration |

## Project Structure

```text
src/
├── app.js                 Express application and middleware
├── server.js              Local process startup and graceful shutdown
├── config/                Environment, Firebase Admin, and database setup
├── controllers/           HTTP handlers for each application area
├── middleware/            Authentication, authorization, validation, CSRF, errors
├── models/                Mongoose schemas and indexes
├── routes/                API route composition
├── utils/                 Errors, responses, pagination, and DTO helpers
└── validations/           Zod request schemas
```

`app.js` exports the Express application for serverless hosting. `server.js` is used for local and traditional process startup, connects to MongoDB before listening, and handles shutdown signals.

## Authentication and Authorization

Firebase is the identity provider. The client sends a Firebase ID token to the session endpoints; the API verifies it with Firebase Admin before looking up the application user.

After verification, the API uses:

- HTTP-only access cookies with a short lifetime
- Rotating refresh cookies
- Hashed refresh-token storage
- CSRF protection for state-changing requests
- Server-side role and account-status checks

The API must never trust a UID, email, role, status, author, or donor identity supplied by the browser when that value can be derived from the authenticated session.

## API Conventions

The base URL is:

```text
/api
```

Successful responses use:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {}
}
```

Errors use the same top-level contract with `success: false`. Validation errors include structured details. Resource identifiers are currently query parameters for compatibility with the existing client, while new endpoints should prefer path parameters.

## Endpoint Overview

### Health

| Method | Path | Access |
|---|---|---|
| `GET` | `/health` | Public |

The endpoint returns HTTP 200 when MongoDB is connected and HTTP 503 otherwise.

### Authentication

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/auth/csrf` | Public |
| `POST` | `/api/auth/create-user` | Verified Firebase token |
| `POST` | `/api/auth/session` | Verified Firebase token |
| `POST` | `/api/auth/refresh-token` | Refresh cookie |
| `POST` | `/api/auth/logout` | Session cookie |
| `GET` | `/api/auth/user` | Authenticated user |
| `PATCH` | `/api/auth/user/update` | Authenticated user |
| `PATCH` | `/api/auth/user/update/role` | Admin |
| `PATCH` | `/api/auth/user/update/status` | Admin |

### Donation Requests

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/donation/create` | Authenticated user |
| `POST` | `/api/donation/claim` | Active donor |
| `GET` | `/api/donation` | Owner or staff scope |
| `GET` | `/api/donation/details` | Owner, claimed donor, or staff |
| `GET` | `/api/donation/paginated` | Owner scope or staff |
| `GET` | `/api/donation/single` | Authenticated user with visibility rules |
| `PATCH` | `/api/donation/update` | Owner or staff |
| `DELETE` | `/api/donation/delete` | Owner or admin |

Donation claims are atomic. A request can only be claimed while it is pending and without an existing donor. Status transitions are validated by the server.

### Blogs

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/blog/post/all` | Public, published posts only |
| `GET` | `/api/blog/post/details` | Public, published posts only |
| `GET` | `/api/blog/management/details` | Admin or volunteer |
| `GET` | `/api/blog/all/paginated` | Admin or volunteer |
| `POST` | `/api/blog/create` | Admin or volunteer |
| `PATCH` | `/api/blog/post/update` | Admin or volunteer |
| `DELETE` | `/api/blog/delete` | Admin |
| `GET` | `/api/blog/verify-permalink` | Public availability check |

Volunteers can create and edit drafts. Only administrators can publish or unpublish posts. Blog HTML is sanitized before persistence and sanitized again by the client before rendering.

### Dashboard and Public Data

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/dashboard/overview` | Admin |
| `GET` | `/api/dashboard/users` | Admin |
| `GET` | `/api/dashboard/donations` | Admin or volunteer |
| `POST` | `/api/public/donors` | Public, active donors only |
| `GET` | `/api/public/donations` | Public pending requests |
| `GET` | `/api/public/status` | Public aggregate statistics |
| `POST` | `/api/public/contact` | Public |
| `POST` | `/api/public/subscribe` | Public |

Public endpoints use explicit projections and must not expose session tokens, payment identifiers, blocked users, or unnecessary personal data.

### Payments

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/payment/create-intent` | Authenticated user |
| `GET` | `/api/payment/funds` | Authenticated user |
| `POST` | `/api/payment/webhooks/stripe` | Stripe signature |

Payment amounts are accepted in BDT and converted to integer minor units. The client never creates a fund record. A successful, signature-verified `payment_intent.succeeded` event creates or updates the record using the PaymentIntent ID as the idempotency key.

Configure the Stripe webhook URL as:

```text
https://<api-host>/api/payment/webhooks/stripe
```

Confirm that the Stripe account supports BDT before enabling this flow in production.

## Database Notes

The API defines indexes for common user, donation, blog, and funding access paths. Pagination is capped at 50 records per request. Monetary values are stored as integer minor units in `Fund.amountMinor`; existing legacy `amount` records are read as a migration fallback.

## Deployment

The repository includes `vercel.json` configured to use `src/app.js` as the serverless entry point. Configure all environment variables in the hosting provider and do not deploy the local `.env` file.

For a traditional deployment:

```bash
npm ci --omit=dev
npm start
```

Before production deployment:

- Rotate any credentials that have ever been exposed.
- Provide Firebase Admin credentials through a secret manager.
- Use HTTPS and set the exact production `ORIGIN`.
- Configure the Stripe webhook signing secret.
- Verify MongoDB network access and backups.
- Monitor `/health` and application error logs.
- Run `npm run lint` and API integration tests in CI.

## Security Notes

- Never accept client-supplied UIDs as proof of identity.
- Never return access or refresh tokens in JSON responses.
- Keep Stripe fund persistence webhook-driven.
- Keep role, ownership, and blocked-status checks on the server.
- Sanitize user-authored HTML before storage and rendering.
- Keep request limits, pagination limits, and endpoint-specific rate limits enabled.

## Current Quality Status

The server has reproducible linting and a health endpoint. Automated unit, integration, and end-to-end tests are not yet included and should be added for authentication, authorization, donation transitions, blog visibility, and Stripe webhook handling.
