## Mini Support Desk – Architecture

### 1. High-level architecture

- **Frontend (React/Vite)** runs in the browser and talks to the backend via REST over HTTP.
- **Backend (Express + Prisma)** exposes a JSON API responsible for validation, business rules, and persistence.
- The frontend calls endpoints under `/tickets` (for both tickets and comments). During local development, Vite proxies these paths to the Node server:
  - Browser → Vite dev server (`5173`) → proxy → Express API server (`4000`) → SQLite via Prisma.

Backend layering:

- **Routes** (`src/routes/*`): translate HTTP requests into service calls; perform request/response shaping and map Zod errors into HTTP 400 responses.
- **Services** (`src/services/*`): host business logic such as defaulting status to `OPEN`, enforcing ticket existence before comment operations, or orchestrating multiple repository calls.
- **Repositories** (`src/repositories/*`): thin wrappers around Prisma that encapsulate query details (filters, pagination, sorting).
- **Prisma client** (`src/prismaClient.ts`): singleton `PrismaClient` instance shared across repositories.

### 2. Data model decisions

Core models (in `prisma/schema.prisma`):

- **Ticket**
  - `id` (UUID), `title`, `description`, `status`, `priority`, `createdAt`, `updatedAt`
  - One-to-many relation to `Comment`.
  - Enums `TicketStatus` (`OPEN | IN_PROGRESS | RESOLVED`) and `TicketPriority` (`LOW | MEDIUM | HIGH`) enforce allowed values at the DB and TypeScript levels.
- **Comment**
  - `id` (UUID), `ticketId`, `authorName`, `message`, `createdAt`
  - Foreign key references `Ticket` with `onDelete: Cascade` so ticket deletion cleans up comments.

Reasons:

- **Separation of concerns**: comments are independent rows keyed by `ticketId`, which keeps the ticket row small and lets comments be paginated efficiently.
- **Enums** for status/priority encode the constrained domain and keep frontend/backed in sync through generated Prisma types.
- **Automatic timestamps** (`@default(now())`, `@updatedAt`) reduce boilerplate and ensure consistency.

### 3. Scalability considerations

- **Ticket list**:
  - `/tickets` supports `page` and `limit` and only returns the current page (`skip`/`take` in Prisma) plus `total` and `totalPages`.
  - For large datasets, this pattern scales better than returning all rows and allows future optimizations like cursor-based pagination.
- **Search performance**:
  - `q` applies an `OR` filter on `title`/`description` with case-insensitive `contains`.
  - In a larger deployment, you would back this with DB indexes on the text fields or move to full-text search (e.g. Postgres `tsvector` or an external search engine).
- **Filtering & sorting**:
  - Status/priority filtering happens in the database (not in memory), so cost is bounded by index performance.
  - Sorting currently supports `createdAt` ascending/descending and is implemented directly in Prisma’s `orderBy`.
- **Frontend state**:
  - React Query caches responses keyed by filters (page, q, status, priority, sort) and uses `keepPreviousData` to make pagination smooth even under high latency.

### 4. Reliability

- **Validation**:
  - Zod schemas in `src/validation/ticketSchemas.ts` validate both body payloads and query parameters.
  - Ticket creation enforces:
    - `title`: 5–80 characters
    - `description`: 20–2000 characters
    - `priority`: enum value with default `MEDIUM`
  - Comment creation enforces:
    - `authorName`: required, up to 100 characters
    - `message`: 1–500 characters
  - Query params for pagination (`page`, `limit`) are parsed as numbers and bounded (`1 <= limit <= 100`).
- **Error handling**:
  - Route handlers catch Zod errors and explicitly return **400 Bad Request** with detailed error information.
  - Business-level “not found” conditions throw an error with `status = 404`, which is picked up by the global error handler.
  - A catch-all error handler logs the error and returns **500 Internal Server Error** for unexpected failures without leaking internal details.
- **Basic logging**:
  - `morgan('dev')` logs incoming requests and response status codes.
  - Critical errors are logged in the global error middleware.

### 5. Tradeoffs and intentional simplifications

- **SQLite + Prisma**:
  - Chosen for easy local setup (single file DB, no external service).
  - In production, the same Prisma schema could be reused with Postgres by only changing the datasource provider and URL.
- **Server-side search & filtering**:
  - The tickets list performs filtering, search, and sorting on the backend. This is slightly more complex than client-side filtering but scales better once the number of tickets grows.
- **Minimal UI stack**:
  - Pure CSS + semantic HTML instead of a heavy UI library keeps bundle size small and the focus on functionality.
  - The layout and components are intentionally simple but responsive and accessible (labels, proper button elements, keyboard-friendly forms).
- **Limited domain features**:
  - No authentication, authorization, or user accounts.
  - No advanced status workflows, attachments, or SLA tracking.
  - These were omitted to keep the assignment focused on core CRUD, data modeling, and clean architecture, but the layered design makes it straightforward to add them.

