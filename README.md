## Mini Support Desk

Small full-stack React + Node.js app for managing support tickets and comments.

### Tech stack

- **Frontend**: React 18, TypeScript, Vite, React Router, React Query, Axios
- **Backend**: Node.js, Express, TypeScript, Prisma, SQLite

### Prerequisites

- Node.js 18+
- npm

### Backend setup

```bash
cd backend
npm install

# Generate Prisma client and create SQLite DB
npx prisma migrate dev --name init

# Seed sample tickets and comments
npm run prisma:seed

# Start API server on http://localhost:4000
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

The frontend dev server proxies API calls to the backend (`/tickets`, `/health`).

### API overview

- **GET** `/tickets` – list tickets with query params:
  - **q**: search in title/description
  - **status**: `OPEN | IN_PROGRESS | RESOLVED`
  - **priority**: `LOW | MEDIUM | HIGH`
  - **sort**: `createdAt_asc | createdAt_desc`
  - **page**: page number (default 1)
  - **limit**: page size (default 10, max 100)
- **POST** `/tickets` – create ticket
- **GET** `/tickets/:id` – get a single ticket
- **PATCH** `/tickets/:id` – update title/description/status/priority
- **DELETE** `/tickets/:id` – delete ticket
- **GET** `/tickets/:id/comments` – list comments for a ticket (paged)
- **POST** `/tickets/:id/comments` – add comment

All write endpoints perform input validation with Zod and return meaningful HTTP status codes and JSON error payloads.

