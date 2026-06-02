Attendees module

This module implements attendee-facing functionality for the Event Ticketing API.

Endpoints implemented

Public endpoints:
- GET /api/attendees/events
  - Query: `page`, `limit`
  - Returns a paginated list of upcoming events with `ticketCount` and metadata.

- GET /api/attendees/events/:eventId
  - Returns event details including `organizer` and `ticketCount`.

Authenticated endpoints (require `Authorization: Bearer <token>`):
- POST /api/attendees/tickets
  - Body: { eventId: string }
  - Purchases a ticket for the authenticated user. Checks:
    - event exists
    - user does not already have a ticket for the event
    - event capacity is not exceeded
  - Returns created ticket (includes `qrCode` used for check-in).

- GET /api/attendees/tickets
  - Lists tickets owned by the authenticated user (paginated).

- GET /api/attendees/tickets/:ticketId
  - Returns a specific ticket if it belongs to the authenticated user.

- DELETE /api/attendees/tickets/:ticketId
  - Cancels (deletes) the ticket if it belongs to the authenticated user.

Implementation notes

- Validation
  - Zod schemas validate request bodies (see `attendees.validation.ts`).

- Concurrency and capacity
  - The current implementation checks capacity using a `count` before creating a ticket.
  - This approach may allow a race condition under heavy concurrent purchases. For stronger guarantees,
    consider using a DB-level locking strategy or moving capacity enforcement into a serializable transaction
    that both checks and creates in the same transaction and retries on conflict.

- QR codes
  - QR codes are generated using `uuid.v4()` to ensure uniqueness and are stored in the `qrCode` column.

- Authorization
  - Authenticated endpoints require `requireAuth` middleware which attaches `req.authUser`.
  - Owners-only checks are enforced in service functions (e.g., ticket belongs to user).

- Logging
  - Key operations (purchase, cancel) are logged via the application logger.

Files added
- `attendees.validation.ts` — request schemas
- `attendees.service.ts` — business logic
- `attendees.controller.ts` — request handlers
- `attendees.routes.ts` — route definitions

Testing
- Start the server and use a valid attendee token to exercise authenticated endpoints.

Security
- Sensitive fields (user password) are never returned by these endpoints.

If you'd like, I can:
- Add an optimistic locking / serializable transaction pattern to eliminate race conditions on capacity.
- Add admin endpoints to mark tickets as checked-in.
- Add OpenAPI documentation for the module.
