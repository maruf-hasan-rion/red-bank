# Red. Bank

A blood donation management platform. MERN monorepo containing the API and web client.

## Structure

| Folder | Description |
| --- | --- |
| `red-bank-server` | Express + MongoDB (Mongoose) REST API. Auth via Firebase + short-lived JWT cookie sessions, Stripe for fund payments. |
| `red-bank-client` | React + Vite + Tailwind CSS + TanStack Query SPA. |

## Getting started

1. Copy the env templates and fill in your values:

   - `red-bank-server/.env.example` → `.env`
   - `red-bank-client/.env.example` → `.env.local`

2. Install dependencies:

   ```bash
   cd red-bank-server && npm install
   cd ../red-bank-client && npm install
   ```

3. Run both dev servers:

   ```bash
   cd red-bank-server && npm run dev   # API on http://localhost:5000
   cd ../red-bank-client && npm run dev # SPA on http://localhost:5173
   ```

See each package's `README.md` for detailed API docs and configuration.