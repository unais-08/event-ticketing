Organizers module

This module implements organizer-facing functionality for the Event Ticketing API.

Base path

- `/api/organizers`

Authentication and authorization

- All routes require `Authorization: Bearer <token>`.
- Access is restricted to users with the `ORGANIZER` role or `ADMIN` role.
- Organizers can only access events they own.
- Admin users may access any organizer event and its ticket list.

Endpoints implemented

- GET /api/organizers/events
  - Query: `page`, `limit`
  - Returns a paginated list of the authenticated organizer's events.
  - Each event includes a `ticketCount` value.

- POST /api/organizers/events
  - Body:
    - `title`: string
    - `description`: string
    - `location`: string
    - `date`: ISO date string
    - `capacity`: integer
  - Creates a new event for the authenticated organizer.

- GET /api/organizers/events/:eventId
  - Returns event details for a single event.
  - The event must belong to the authenticated organizer unless the requester is an admin.

- PUT /api/organizers/events/:eventId
  - Body: any subset of the create-event fields
  - Updates an existing event.
  - The event must belong to the authenticated organizer unless the requester is an admin.

- DELETE /api/organizers/events/:eventId
  - Deletes the event and all tickets associated with it.
  - The event must belong to the authenticated organizer unless the requester is an admin.

- GET /api/organizers/events/:eventId/tickets
  - Returns all tickets for the specified event.
  - Includes ticket holder information such as name and email.
  - The event must belong to the authenticated organizer unless the requester is an admin.

Implementation notes

- Validation
  - Zod schemas validate event create and update payloads in `organizers.validation.ts`.
  - Title, description, location, and capacity constraints are enforced at the API layer before persistence.

- Ownership checks
  - Service functions verify event ownership before reading or mutating organizer resources.
  - The controller passes an admin flag so admins can bypass ownership checks where appropriate.

- Event listing
  - Event lists are paginated and sorted by `createdAt` descending.
  - Ticket counts are calculated per event before returning the response.

- Event deletion
  - Event deletion runs inside a Prisma transaction and removes associated tickets first to avoid orphan records.

- Logging
  - Successful create, update, and delete operations are logged through the shared application logger.

Files

- `organizers.validation.ts` - request schemas and TypeScript input types
- `organizers.service.ts` - business logic and database access
- `organizers.controller.ts` - request handlers and response shaping
- `organizers.routes.ts` - route definitions and auth middleware

Testing

- Start the backend and call the routes with a valid organizer or admin token.
- Verify that organizer-owned events are accessible and that cross-owner access is rejected for non-admin users.

If you'd like, I can also add a matching OpenAPI-style reference for this module.