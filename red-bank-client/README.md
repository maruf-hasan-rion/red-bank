# Red.Bank Client

The Red.Bank client is the React application for the blood donation platform. It provides donor search, donation-request management, blog content management, profile management, and funding workflows.

The frontend is intentionally separated from the API. It authenticates users with Firebase Authentication, sends the Firebase ID token to the API, and uses the API-issued HTTP-only session cookies for application requests.

## Features

- Firebase email/password authentication
- Server-backed session bootstrap and refresh
- Donor search by blood group and location
- Create, claim, update, and track donation requests
- Role-aware donor, volunteer, and administrator dashboards
- Blog creation, editing, publication, and public reading
- Cloudinary image upload with client-side compression
- Stripe card payments in BDT
- Funding history and client-side PDF export
- Responsive layouts with Tailwind CSS
- React Query caching and request-state handling
- Accessible focus states, labels, errors, and modal semantics

## Technology

- React 18
- Vite
- React Router
- TanStack React Query
- Firebase Authentication
- Axios
- Tailwind CSS
- Radix UI primitives
- Stripe Elements
- React Hook Form
- Cloudinary

## Requirements

- Node.js 20 or newer
- npm
- A running Red.Bank server
- Firebase project with Email/Password sign-in enabled
- Cloudinary upload preset
- Stripe publishable key

## Local Setup

From this directory:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, the copy step is:

```powershell
Copy-Item .env.example .env.local
```

The Vite development server runs on `http://localhost:5173` by default.

## Environment Variables

Copy `.env.example` to `.env.local`. Values prefixed with `VITE_` are embedded in the browser bundle, so never put private credentials in this file.

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |
| `VITE_BASE_URL` | API origin, for example `http://localhost:5000` |
| `VITE_CLOUDINARY_PRESET` | Restricted Cloudinary upload preset |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

`VITE_BASE_URL` must point to the server origin without an `/api` suffix. The client appends `/api` itself.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the client |

## Project Structure

```text
src/
├── components/       Shared application and UI components
├── context/          Global authentication state
├── hooks/            Reusable client behavior and integrations
├── Layout/           Public, authentication, and dashboard layouts
├── lib/              Constants, navigation, editor configuration, utilities
├── pages/            Route-level screens and feature views
├── Routes/           Browser route definitions and access guards
├── services/         API client modules
├── Root.jsx          Application providers and router mounting
└── main.jsx          Browser entry point
```

## Client Architecture

Route components are responsible for screen composition. API calls are kept in `src/services`, reusable behavior belongs in `src/hooks`, and shared controls belong in `src/components/ui` or `src/components/shared`.

The request flow is:

1. Firebase authenticates the browser user.
2. Axios sends the Firebase ID token as a bearer token to `POST /api/auth/session` or `POST /api/auth/create-user`.
3. The server verifies the token and sets HTTP-only access and refresh cookies.
4. Mutating requests obtain and send the CSRF token automatically.
5. Expired API sessions are refreshed through a single-flight refresh request.

Payment records are not created by the browser. The client creates and confirms a Stripe PaymentIntent; the server creates the funding record after receiving a verified Stripe webhook.

## Routing

Important public routes:

- `/`
- `/donor/search`
- `/donation-requests`
- `/blogs`
- `/blogs/:id`
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`

Important authenticated routes:

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/create-donation-request`
- `/dashboard/my-donation-request`
- `/fundings`

Administrator and volunteer routes are protected in the UI and must also be authorized by the API.

## Uploads

Images are compressed in the browser before being sent to Cloudinary. The upload preset must be restricted by file type, size, transformations, and folder. Browser-side validation is only a user-experience feature and is not a security boundary.

## Production Checklist

- Set all client environment variables in the hosting provider.
- Set `VITE_BASE_URL` to the HTTPS API origin.
- Add the deployed client domain to Firebase authorized domains.
- Use a restricted Cloudinary upload preset.
- Use a Stripe publishable key matching the server environment.
- Confirm that the server Stripe account supports BDT payments.
- Run `npm run lint` and `npm run build` in CI.
- Do not commit `.env.local` or generated credentials.
- Verify registration, session refresh, donation claiming, blog publication, and payment webhook flows after deployment.

## Current Quality Status

The client currently has lint and production-build scripts. Automated unit, integration, and end-to-end tests should be added for authentication, authorization, donations, payment states, and critical route flows before production release.
