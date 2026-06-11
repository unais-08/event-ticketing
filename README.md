# Event Ticketing QR Check-ins (EventFlow)

EventFlow is a role-based event ticketing platform with QR-code check-in. It includes:

- **Backend (Node.js + Express + TypeScript + Prisma + PostgreSQL)**
- **Frontend (Next.js + React + Tailwind CSS + TypeScript)**

This project is intended for **academic and learning purposes only**.

---

## Features

- **Role-based authentication** using JWT
  - **ATTENDEE**: browse events, purchase/cancel tickets, view QR codes
  - **ORGANIZER**: create/update/delete their events, inspect ticket holders
  - **CHECKER**: check-in tickets at the venue using QR tokens
  - **ADMIN**: manage users, bypass ownership restrictions where required
- **Ticket purchasing** with uniqueness constraints (one ticket per user per event)
- **QR token generation** (JWT-signed) and QR images rendered as **data URLs**
- **QR check-in flow**
  - validate token
  - authorize request based on role
  - mark the ticket as checked-in

---

## Architecture Overview

### High-level request flow

1. **Attendee purchases a ticket** via backend.
2. Backend stores a `qrCode` and provides a **check-in URL** encoded into a QR image.
3. **Checker/Organizer/Admin checks in** by submitting the QR token to the check-in endpoint.
4. Backend validates the token and updates the ticket record.

### Modules

Backend is structured by feature modules:

- `modules/auth/*` — registration, login, middleware, validation
- `modules/users/admin/*` — admin user management APIs
- `modules/users/organizers/*` — organizer event and ticket APIs
- `modules/users/attendees/*` — attendee event and ticket APIs
- `modules/checkin/*` — QR generation (token URLs) and check-in by token

---

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL
- npm

---

## Environment Variables

### Backend

Create an `.env` file inside `backend/`.

Required:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret used to sign JWTs and QR tokens

Recommended / optional:

- `PORT` — backend port (default: `8080`)
- `JWT_EXPIRES_IN` / `QR_EXPIRES_IN` — QR token expiry (implementation reads `QR_EXPIRES_IN` then falls back to `JWT_EXPIRES_IN`, default seen in code as `24h`)
- `ALLOWED_ORIGINS` — comma-separated CORS origins (default includes `http://localhost:3000`)

> Note: the check-in QR generator expects `QR_SECRET` or `JWT_SECRET` to be set.

---

## Database Setup

Backend uses Prisma. The schema is defined in:

- `backend/prisma/schema.prisma`

It models:

- `User` with role: `ATTENDEE | ORGANIZER | CHECKER | ADMIN`
- `Event` with `organizerId`
- `Ticket` with a unique `qrCode` and `checkedIn` flag

### Migrations

Migrations are located in:

- `backend/prisma/migrations/*`

---

## Running the Project

### 1) Backend

From the `backend/` directory:

```bash
npm install

# (optional) run Prisma generate + migrations depending on your environment
npm run build

npm run start
```

Development:

```bash
npm run dev
```

Optional seeding:

```bash
npm run seed
```

### 2) Frontend

From the `frontend/` directory:

```bash
npm install

npm run dev
```

The UI is configured to work with the backend at `/api`.

---

## API Reference (Key Endpoints)

All backend routes are mounted under `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
  - Requires: `Authorization: Bearer <token>`

### Admin Users (ADMIN)

- `GET /api/admin/users`
- `POST /api/admin/users/organizers`
- `POST /api/admin/users/checkers`
- `DELETE /api/admin/users/attendees/:userId`
- `DELETE /api/admin/users/organizers/:userId`
- `DELETE /api/admin/users/checkers/:userId`

### Organizer Events (ORGANIZER / ADMIN)

- `GET /api/organizers/events`
- `POST /api/organizers/events`
- `GET /api/organizers/events/:eventId`
- `PUT /api/organizers/events/:eventId`
- `DELETE /api/organizers/events/:eventId`
- `GET /api/organizers/events/:eventId/tickets`

### Attendee Events & Tickets

Public:

- `GET /api/attendees/events`
- `GET /api/attendees/events/:eventId`

Authenticated:

- `POST /api/attendees/tickets`
- `GET /api/attendees/tickets`
- `GET /api/attendees/tickets/:ticketId`
- `DELETE /api/attendees/tickets/:ticketId`
- `GET /api/attendees/tickets/:ticketId/qr`

### Check-in (CHECKER / ORGANIZER / ADMIN)

- `GET /api/checkin/tickets/:ticketId/qr`
- `POST /api/checkin/:token`
  - Requires: `Authorization: Bearer <token>`
  - Uses JWT token embedded in QR.

---

## QR Token & Check-in Implementation Notes

- QR content is a **signed JWT** containing `ticketId`.
- QR image is generated as a **data URL** using the backend.
- Check-in verifies:
  - token validity and expiry
  - ticket existence
  - authorization rules based on role and event organizer
  - idempotency: already-checked tickets are handled without reprocessing

---

## Frontend Notes

Frontend uses:

- Next.js App Router (`frontend/app/*`)
- Zustand for auth state (`frontend/app/_stores/auth-store.ts`)
- Role-specific landing/dashboard experience (`RoleWorkspace`)

Core API integration is centralized in:

- `frontend/app/_lib/api.ts`

Authentication/session is handled by `AuthProvider` and stored via:

- `localStorage` for user/token
- a cookie `eventflow_role` for role-aware routing

---

## Seed Data (Optional)

Backend includes a seed script (`backend/src/utils/seed.ts`) that:

- creates an admin
- creates sample organizers and checkers
- creates attendees
- creates upcoming events per organizer
- creates tickets with unique QR codes

---

## Project Structure

- `backend/`
  - `src/app.ts` — Express app + route mounting
  - `src/server.ts` — server bootstrap
  - `src/modules/` — feature modules
  - `src/config/` — Prisma and logger
  - `prisma/` — schema and migrations

- `frontend/`
  - `app/` — pages/layout/components
  - `app/_lib/` — typed API client
  - `app/_stores/` — state management

---

## License

See `LICENSE.md`.

---

## Academic / Learning Use Disclaimer

This project is distributed for **educational and learning purposes only**. Commercial use is prohibited without explicit permission. Any use is at your own risk.

