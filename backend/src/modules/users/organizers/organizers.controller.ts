import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { logger, serializeError } from "../../../config/logger.js";
import {
  createEventSchema,
  updateEventSchema,
} from "./organizers.validation.js";
import {
  listEventsForOrganizer,
  createEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  listTicketsForEvent,
  type UpdateEventPayload,
} from "./organizers.service.js";

/**
 * Controller for organizer-facing endpoints.
 * - Each handler expects `req.authUser` to be set by `requireAuth` middleware.
 * - Authorization rules: organizers may only act on their own resources; admins are allowed.
 */

function isAdmin(req: Request): boolean {
  return req.authUser?.role === Role.ADMIN;
}

export async function listEvents(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) || 1 : 1;
  const limit = typeof req.query.limit === "string" ? Math.min(Number.parseInt(req.query.limit, 10) || 20, 100) : 20;

  try {
    const result = await listEventsForOrganizer(req.authUser!.id, page, limit);

    res.status(200).json({ message: "Events retrieved successfully.", data: result });
  } catch (error) {
    logger.error("Failed to list organizer events.", { requestId: req.requestId, error: serializeError(error) });
    res.status(500).json({ message: "Unable to list events." });
  }
}

export async function createNewEvent(req: Request, res: Response): Promise<void> {
  const parsed = createEventSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const event = await createEvent(req.authUser!.id, parsed.data);
    res.status(201).json({ message: "Event created.", data: event });
  } catch (error) {
    logger.error("Failed to create event.", { requestId: req.requestId, error: serializeError(error) });
    res.status(400).json({ message: (error as Error).message ?? "Unable to create event." });
  }
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params.eventId;

  if (typeof eventId !== "string" || eventId.length === 0) {
    res.status(400).json({ message: "Event id is required." });
    return;
  }

  try {
    const details = await getEventDetails(req.authUser!.id, eventId, isAdmin(req));
    res.status(200).json({ message: "Event details retrieved.", data: details });
  } catch (error) {
    logger.error("Failed to get event details.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to retrieve event." });
  }
}

export async function updateExistingEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params.eventId;
  if (typeof eventId !== "string" || eventId.length === 0) {
    res.status(400).json({ message: "Event id is required." });
    return;
  }

  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const updated = await updateEvent(req.authUser!.id, eventId, parsed.data as UpdateEventPayload, isAdmin(req));
    res.status(200).json({ message: "Event updated.", data: updated });
  } catch (error) {
    logger.error("Failed to update event.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to update event." });
  }
}

export async function removeEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params.eventId;
  if (typeof eventId !== "string" || eventId.length === 0) {
    res.status(400).json({ message: "Event id is required." });
    return;
  }

  try {
    const result = await deleteEvent(req.authUser!.id, eventId, isAdmin(req));
    res.status(200).json({ message: "Event deleted.", data: result });
  } catch (error) {
    logger.error("Failed to delete event.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to delete event." });
  }
}

export async function getEventTickets(req: Request, res: Response): Promise<void> {
  const eventId = req.params.eventId;
  if (typeof eventId !== "string" || eventId.length === 0) {
    res.status(400).json({ message: "Event id is required." });
    return;
  }

  try {
    const tickets = await listTicketsForEvent(req.authUser!.id, eventId, isAdmin(req));
    res.status(200).json({ message: "Tickets retrieved.", data: tickets });
  } catch (error) {
    logger.error("Failed to list tickets.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to list tickets." });
  }
}
