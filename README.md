# tinyr – Privacy-First URL Shortener

A modern, full-stack URL shortening service built with React, Express, PostgreSQL, and Redis. No accounts required. No tracking. Links are session-bound to your browser.

**[Live Demo](https://urltinyr.com)** | [Repository](https://github.com/jingavin/short-url)

---

## Overview

tinyr demonstrates a complete, production-ready full-stack application designed with portfolio showcase in mind. The project emphasizes:

- **Privacy by Design**: Anonymous visitor tracking via session cookies—no user accounts or persistent tracking
- **Performance**: Multi-layer caching (Redis + Database) for instant redirects
- **Scalability**: Rate limiting, deduplication, and optimized database queries
- **Type Safety**: Shared TypeScript types across frontend and backend eliminate API contract bugs
- **Modern Architecture**: Monorepo structure with clear separation of concerns

### Core Value Proposition

Users paste a long URL → tinyr generates a 7-character short code → short code redirects to original URL. That's it. No sign-up, no tracking, no noise.

---

## Tech Stack

### Frontend

- **React 19** – Modern UI framework with hooks and concurrent rendering
- **TypeScript 5** – Type-safe component and state management
- **Vite 7** – Lightning-fast development server and build tool
- **TailwindCSS 4** – Utility-first CSS framework
- **shadcn/ui** – Accessible, composable component library (Radix UI + CVA)
- **TanStack React Query 5** – Server state management with automatic caching/refetching
- **Sonner** – Toast notifications for UX feedback
- **Lucide React** – Icon library

### Backend

- **Express.js 4** – Minimal, fast Node.js web framework
- **TypeScript 5** – Type-safe server logic
- **Drizzle ORM 0.45** – Type-safe SQL query builder with migrations
- **PostgreSQL** – NeonDB, relational database
- **Redis 5** – In-memory cache and rate limiting store
- **Cookie-Parser** – Secure session cookie handling

### Infrastructure & Patterns

- **Monorepo (Yarn/npm Workspaces)** – Shared types across api/web/shared
- **Drizzle Migrations** – Version-controlled schema changes
- **Docker-ready** – Can be containerized for production deployment

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                    http://localhost:5173                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Create short links (POST /api/links)               │   │
│  │ • View recent links (GET /api/links/recent)          │   │
│  │ • Delete links (DELETE /api/links/:id)               │   │
│  │ • Session info (GET /api/session)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    HTTPS / CORS / Cookies
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + TypeScript)             │
│                    http://localhost:3000                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Link shortening logic                              │   │
│  │ • Code generation & deduplication                    │   │
│  │ • Rate limiting (Redis)                              │   │
│  │ • Session management (HttpOnly cookies)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
    PostgreSQL                              Redis
    (Persistent Data)                  (Cache & Rate Limit)
    • links table                       • URL→code mapping
    • Created/deleted links             • Code→URL mapping
    • Visitor associations              • Request counters
```

### Monorepo Structure

```
url-shortener/
├── apps/
│   ├── api/              # Express backend server
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point, route definitions
│   │   │   ├── db/
│   │   │   │   ├── client.ts      # Database connection
│   │   │   │   └── schema.ts      # Drizzle ORM table definitions
│   │   │   └── lib/
│   │   │       ├── code.ts        # Code generation & deduplication
│   │   │       ├── redis.ts       # Redis client setup
│   │   │       └── redisKeys.ts   # Redis key naming conventions
│   │   ├── drizzle/               # Database migrations (auto-generated)
│   │   ├── drizzle.config.ts      # Drizzle configuration
│   │   ├── package.json           # api workspace dependencies
│   │   └── tsconfig.json
│   │
│   └── web/              # React frontend (Vite SPA)
│       ├── src/
│       │   ├── main.tsx           # React entry point
│       │   ├── App.tsx            # Root component
│       │   ├── components/
│       │   │   ├── ShortenLinkForm.tsx    # Link creation form
│       │   │   ├── RecentLinksTable.tsx   # Link history view
│       │   │   └── ui/                   # shadcn/ui components
│       │   ├── pages/
│       │   │   └── Home.tsx
│       │   └── lib/
│       │       ├── api.ts         # Fetch-based API client
│       │       ├── env.ts         # Environment validation
│       │       └── utils.ts       # Utility functions
│       ├── vite.config.ts
│       ├── package.json           # web workspace dependencies
│       └── tsconfig.json
│
├── packages/
│   └── shared/          # Shared TypeScript types
│       ├── src/
│       │   └── index.ts # API contract types (routes, payloads)
│       ├── package.json
│       └── tsconfig.json
│
└── package.json         # Root workspace configuration
```

### Why Monorepo?

1. **Shared Types**: Frontend and backend import from `@tinyr/shared` for type-safe API contracts
2. **Single Command**: `npm run dev` starts both services with live reloading
3. **Unified Deployment**: Can build and deploy as single application
4. **Code Reusability**: Utilities, validation logic shared without duplication

---

## Key Features & Implementation

### 1. **Link Shortening with Deduplication**

**Endpoint**: `POST /api/links`

Creating a short link involves:

- Validate URL (must be http/https)
- Check Redis cache for existing code (SHA-256 hash of URL)
- If miss, check database
- If not found, generate new 7-character alphanumeric code (base-62 encoding)
- Store in database + cache
- Return code

**Result**: Deduplication prevents duplicate codes for the same URL, saving space and ensuring users always see the same short code for a URL they've seen before.

### 2. **Fast Redirects with Redis Caching**

**Endpoint**: `GET /:code`

Redirect flow:

1. Check Redis cache for `c:{code}` → long URL (24-hour TTL)
2. Cache miss → Query PostgreSQL
3. Cache hit → Return 302 redirect instantly
4. Update Redis on database hits

**Result**: Repeat visits have sub-millisecond latency.

### 3. **Rate Limiting (20 requests/60 seconds per IP)**

**Implementation**: Redis-backed sliding window counter

- Key: `rl:links:create:{IP}`
- Increments on each link creation
- Expires after 60 seconds
- Returns 429 Too Many Requests if exceeded

**Result**: Prevents abuse and demonstrates knowledge of rate limiting patterns used in production APIs.

### 4. **Anonymous Session Management**

**Endpoint**: `GET /api/session`

- Generates UUID `visitorId` on first visit
- Stored in HttpOnly, SameSite=Lax cookie
- All links associated with visitor UUID
- Users see only their own links

**Security**: HttpOnly prevents JavaScript access; SameSite prevents CSRF.

### 5. **Soft Delete Pattern**

**Endpoints**: `DELETE /api/links/:id` or `DELETE /api/links` (all)

- Links marked with `deleted=true` instead of removed
- Deleted links still redirect (preserves link lifespan)
- `GET /api/links/recent` filters out deleted links for UI
- Database retained for analytics/auditing

---

## Database Design

### Schema

```sql
CREATE TABLE links (
  id UUID PRIMARY KEY,
  visitor_id UUID NOT NULL,           -- Anonymous visitor ID
  code TEXT NOT NULL UNIQUE,          -- Short code (7 chars)
  long_url TEXT NOT NULL,             -- Original URL
  created_at TIMESTAMP WITH TIME ZONE,
  deleted BOOLEAN DEFAULT false       -- Soft delete flag
);

-- Indexes for query performance
CREATE INDEX idx_links_code ON links(code);
CREATE INDEX idx_links_visitor_id ON links(visitor_id);
```

### Design Decisions

| Decision            | Rationale                                                 |
| ------------------- | --------------------------------------------------------- |
| UUID for `id`       | Globally unique, no coordination needed across services   |
| `visitor_id` UUID   | Supports anonymous sessions without user table            |
| `code` UNIQUE index | Fast code lookups; prevents duplicates at DB level        |
| Soft deletes        | Preserves link history; allows "undo" features; auditable |
| No user table       | Simplifies schema; privacy-first (no persistent accounts) |

### Migrations

Database schema managed with **Drizzle Migrations** (`apps/api/drizzle/`). Each migration is auto-generated and version-controlled:

```bash
npm run db:generate  # Auto-generate new migration
npm run db:migrate   # Apply to database
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (with npm or yarn)
- **PostgreSQL** 14+ (local or cloud)
- **Redis** 6+ (local or cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/jingavin/short-url.git
cd url-shortener

# Install dependencies (all workspaces)
npm install

# Create .env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Environment Setup

**apps/api/.env**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tinyr
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**apps/web/.env**

```env
VITE_API_URL=http://localhost:3000
```

### Database Setup

```bash
# Generate + apply migrations
npm run db:migrate

# Optional: Open Drizzle Studio (visual database editor)
npm run db:studio
```

### Run Development Servers

```bash
# Start both frontend (Vite) and backend (tsx watch)
npm run dev

# Or individually:
npm run dev:web   # Frontend only (http://localhost:5173)
npm run dev:api   # Backend only (http://localhost:3000)
```

### Build for Production

```bash
npm run build      # Builds both frontend and backend
npm run start      # Runs production build
```

---

## Overall

### Full-Stack Capability

- Complete frontend-to-database implementation
- Frontend (React, state management, UI)
- Backend (REST API, middleware, business logic)
- Database (schema design, migrations, indexing)
- Infrastructure (caching, rate limiting)

### Modern Tech Choices

- React 19 with hooks and concurrent features
- TypeScript for type safety across boundaries
- Vite for fast local development
- Drizzle ORM for type-safe database queries
- shadcn/ui for composable, accessible components

### Production-Ready Patterns

- Rate limiting (prevents abuse)
- Multi-layer caching (performance)
- Soft deletes (data preservation)
- Input validation (security)
- CORS configuration (security)
- HttpOnly cookies (session security)
- Error handling (graceful UX)
- Database migrations (version control)

### Performance Optimization

- Redis caching reduces database load
- Deduplication eliminates redundant codes
- Efficient database indexes for fast lookups
- Vite's instant HMR for developer experience

### Code

- TypeScript throughout (no `any` types)
- Shared type definitions prevent API contract mismatches
- ESLint configuration for consistency
- Component composition with shadcn/ui

### Developer Experience

- Monorepo structure with shared dependencies
- Concurrent dev scripts (one command, everything runs)
- Drizzle Studio for visual database inspection
- React Query for automatic cache invalidation

---

## Project Structure Reference

```
tinyr/
├── apps/
│   ├── api              # Express backend (Node.js)
│   │   ├── drizzle/     # Database migrations
│   │   └── src/         # TypeScript source
│   │
│   └── web              # React frontend (SPA)
│       └── src/         # TypeScript + React JSX
│
├── packages/
│   └── shared           # Shared TypeScript types
│
└── README.md            # This file
```

---

## Key Files Reference

| File                                                         | Purpose                                       |
| ------------------------------------------------------------ | --------------------------------------------- |
| [apps/api/src/index.ts](apps/api/src/index.ts)               | API route definitions and middleware setup    |
| [apps/api/src/db/schema.ts](apps/api/src/db/schema.ts)       | Database table definitions (Drizzle ORM)      |
| [apps/api/src/lib/code.ts](apps/api/src/lib/code.ts)         | Code generation and deduplication logic       |
| [apps/api/src/lib/redis.ts](apps/api/src/lib/redis.ts)       | Redis client and caching utilities            |
| [apps/web/src/App.tsx](apps/web/src/App.tsx)                 | Root React component and page layout          |
| [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts)           | Fetch-based API client with React Query       |
| [packages/shared/src/index.ts](packages/shared/src/index.ts) | TypeScript type definitions for API contracts |
