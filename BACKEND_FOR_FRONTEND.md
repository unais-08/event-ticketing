# Backend Integration Guide for Frontend Development

Purpose
-------
This document provides a concise, developer-focused summary of the backend so a frontend agent or engineer can build a production-ready Next.js + Tailwind + TypeScript frontend that aligns exactly with backend schemas, endpoints, and auth conventions.

Assumptions
-----------
- Backend is ~75% complete and stabilized.
- Frontend will be implemented with Next.js, Tailwind CSS, and TypeScript.
- Tailwind and project initialization are already done; this guide focuses on API integration and data models.

Quick Facts
-----------
- API base: `/api` (see [backend/src/app.ts](backend/src/app.ts#L1-L40))
- Server startup: `PORT` env var default 8080 (see [backend/src/server.ts](backend/src/server.ts#L1-L40))
- DB: PostgreSQL via Prisma; schema at [prisma/schema.prisma](prisma/schema.prisma#L1-L200)
- Auth: JWT Bearer tokens. Required env: `JWT_SECRET`; optional `JWT_EXPIRES_IN`. (see [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts#L1-L40))

Environment / Secrets (required for local integration)
---------------------------------------------------
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret used to sign JWTs
- Optional: `JWT_EXPIRES_IN` (default `1d`), `PORT`

Primary Models (from Prisma)
----------------------------
Copy these into your TypeScript types or generate types from Prisma client.

TypeScript interfaces (recommended):

```ts
export type Role = "ATTENDEE" | "ORGANIZER" | "CHECKER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string; // ISO date string
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string; // ISO date string
  capacity: number;
  organizerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  qrCode: string;
  checkedIn: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string; // JWT
  tokenType: "Bearer";
  expiresIn: string; // same value as `JWT_EXPIRES_IN`
}
```

API Endpoints (summary)
------------------------
All endpoints return JSON in the format `{ message: string, data?: any, errors?: any }` on success or error.

Auth (public)
- POST `/api/auth/register` — body: `{ name, email, password }` — returns `201` with `AuthSession` in `data`.
  - Validation: see [backend/src/modules/auth/auth.validation.ts](backend/src/modules/auth/auth.validation.ts#L1-L80)
- POST `/api/auth/login` — body: `{ email, password }` — returns `200` with `AuthSession` in `data`.
- GET `/api/auth/me` — header `Authorization: Bearer <token>` — returns `200` with `{ data: { user } }`.

Admin Users (require role `ADMIN`)
- GET `/api/admin/users` — query `?page=&limit=&role=` — returns paginated users. (see [backend/src/modules/users/admin/users/admin-users.controller.ts](backend/src/modules/users/admin/users/admin-users.controller.ts#L1-L80))
- POST `/api/admin/users/organizers` — body same as register — creates organizer account.
- POST `/api/admin/users/checkers` — body same as register — creates checker account.
- DELETE endpoints to remove organizers/checkers/attendees: `/api/admin/users/organizers/:userId`, `/api/admin/users/checkers/:userId`, `/api/admin/users/attendees/:userId`.

Organizer endpoints (require `ORGANIZER` or `ADMIN`)
- GET `/api/organizers/events` — list organizer events (query `page`, `limit`).
- POST `/api/organizers/events` — create event.
  - Body (createEventSchema): `{ title, description, location, date (ISO string), capacity }`.
- GET `/api/organizers/events/:eventId` — get event details (organizers can only access their events unless ADMIN).
- PUT `/api/organizers/events/:eventId` — update event — body uses `updateEventSchema` (partial of create).
- DELETE `/api/organizers/events/:eventId` — delete event.
- GET `/api/organizers/events/:eventId/tickets` — list tickets for an event.

Attendee (public + authenticated)
- GET `/api/attendees/events` — public list events (query `page`, `limit`).
- GET `/api/attendees/events/:eventId` — public event details.
- POST `/api/attendees/tickets` — require auth. Body: `{ eventId: string (uuid) }` — purchases a ticket; returns `201` with `Ticket`.
  - Validation: see [backend/src/modules/users/attendees/attendees.validation.ts](backend/src/modules/users/attendees/attendees.validation.ts#L1-L40)
- GET `/api/attendees/tickets` — authenticated — list current user's tickets (pagination).
- GET `/api/attendees/tickets/:ticketId` — authenticated — get single ticket (403 if not owner).
- DELETE `/api/attendees/tickets/:ticketId` — authenticated — cancel ticket (403 if not owner).
- GET `/api/attendees/tickets/:ticketId/qr` — authenticated — returns QR data URL for the ticket (delegates to checkin QR generator).

Check-in (organizers, checkers, admin)
- GET `/api/checkin/tickets/:ticketId/qr` — returns QR data for a ticket (owner or organizer/admin may fetch).
- POST `/api/checkin/:token` — body may include `{ token }` or token in URL — required role: `ORGANIZER`, `CHECKER`, or `ADMIN` (or `ADMIN/CHECKER` bypass ownership). Returns ticket check-in result.

Auth & Headers
---------------
- All authenticated endpoints require header: `Authorization: Bearer <token>`.
- Tokens are JWTs signed with `JWT_SECRET`. The token payload contains `sub` (user id), `email`, `name`, and `role`.
- Use the `AuthSession` returned by `/api/auth/login` or `/api/auth/register` to populate client session.

Pagination and Query Params
---------------------------
- Many list endpoints accept `page` and `limit` query params. Defaults and server limits are enforced server-side (see controllers).
- Dates: backend expects ISO date strings for event creation/update; validate on the frontend before sending.

Validation Sources (reference)
- `registerSchema`, `loginSchema`: [backend/src/modules/auth/auth.validation.ts](backend/src/modules/auth/auth.validation.ts#L1-L80)
- `createEventSchema`, `updateEventSchema`: [backend/src/modules/users/organizers/organizers.validation.ts](backend/src/modules/users/organizers/organizers.validation.ts#L1-L80)
- `purchaseTicketSchema`: [backend/src/modules/users/attendees/attendees.validation.ts](backend/src/modules/users/attendees/attendees.validation.ts#L1-L40)

Where to look for server logic
-----------------------------
- Route registrations: [backend/src/app.ts](backend/src/app.ts#L1-L40)
- Prisma models & migrations: [prisma/schema.prisma](prisma/schema.prisma#L1-L200) and `prisma/migrations`
- Auth middleware & service: [backend/src/modules/auth/auth.middleware.ts](backend/src/modules/auth/auth.middleware.ts#L1-L120) and [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts#L1-L320)
- Controllers for behavior: `backend/src/modules/*/*/*.controller.ts` (attendees, organizers, checkin, admin users)

Frontend integration recommendations (practical)
---------------------------------------------
- Generate TypeScript types from Prisma (recommended): use `prisma generate` and import types from Prisma client to avoid drift.
- Mirror Zod validation on the frontend for inputs using shared Zod schemas if you extract them into a shared package; otherwise duplicate the same constraints in TypeScript + client-side validation.
- Centralize API client: create a typed API client (`/lib/api.ts`) that wraps fetch and attaches `Authorization` header when logged in. Return typed responses like `APIResponse<T>` where `APIResponse<T> = { message: string; data?: T; errors?: Record<string,string[]> }`.
- Use strict types for form inputs and server responses — prefer `unknown` guards and runtime validation when receiving data from the server.
- For QR images, the backend returns a data URL string inside `data`; render with an `<img src={data} />` or convert to blob if needed.

Developer notes & gotchas
-------------------------
- Auth extraction throws detailed errors and returns `401`/`403` for invalid tokens — handle these cases by clearing client session and redirecting to login.
- Ticket QR generation uses the request origin/host; when testing locally, ensure `origin` is set or pass `host` appropriately (the backend already falls back to constructed host).
- Deleting resources triggers cascading behavior — check server responses for summaries.

Next steps for frontend agent
----------------------------
1. Use this file and generate typed models from Prisma or manually copy the `TypeScript interfaces` above.
2. Implement API client with base `/api` and typed endpoint methods for auth, events, tickets, and checkin.
3. Implement pages/components incrementally: Landing (events list), Event details, Purchase flow, User tickets dashboard, Organizer dashboards, Admin user management, Check-in scanner UI (accepts token or reads QR).

If anything in this document is unclear or you want more endpoint examples (request/response samples), ask and I will add them.
