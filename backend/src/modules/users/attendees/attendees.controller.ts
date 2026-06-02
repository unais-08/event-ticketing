import type { Request, Response } from "express";
import { logger, serializeError } from "../../../config/logger.js";
import {
  purchaseTicketSchema,
} from "./attendees.validation.js";
import {
  listPublicEvents,
  getPublicEventDetails,
  purchaseTicket,
  listTicketsForUser,
  getTicketDetails,
  cancelTicket,
} from "./attendees.service.js";

/**
 * Controller for attendee endpoints (public and authenticated).
 * - Public endpoints: list events, get event details
 * - Authenticated endpoints (require `req.authUser`): purchase ticket, list/cancel tickets
 */

export async function publicListEvents(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) || 1 : 1;
  const limit = typeof req.query.limit === "string" ? Math.min(Number.parseInt(req.query.limit, 10) || 20, 100) : 20;

  try {
    const result = await listPublicEvents(page, limit);
    res.status(200).json({ message: "Events retrieved.", data: result });
  } catch (error) {
    logger.error("Failed to retrieve public events.", { requestId: req.requestId, error: serializeError(error) });
    res.status(500).json({ message: "Unable to retrieve events." });
  }
}

export async function publicGetEvent(req: Request, res: Response): Promise<void> {
  const eventId = req.params.eventId;
  if (typeof eventId !== "string" || eventId.length === 0) {
    res.status(400).json({ message: "Event id is required." });
    return;
  }

  try {
    const details = await getPublicEventDetails(eventId);
    res.status(200).json({ message: "Event details retrieved.", data: details });
  } catch (error) {
    logger.error("Failed to retrieve event details.", { requestId: req.requestId, error: serializeError(error) });
    res.status(404).json({ message: (error as Error).message ?? "Event not found." });
  }
}

export async function purchaseTicketHandler(req: Request, res: Response): Promise<void> {
  const parsed = purchaseTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const ticket = await purchaseTicket(req.authUser!.id, parsed.data.eventId);
    res.status(201).json({ message: "Ticket purchased.", data: ticket });
  } catch (error) {
    logger.warn("Ticket purchase failed.", { requestId: req.requestId, error: serializeError(error) });
    res.status(400).json({ message: (error as Error).message ?? "Unable to purchase ticket." });
  }
}

export async function listMyTickets(req: Request, res: Response): Promise<void> {
  const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) || 1 : 1;
  const limit = typeof req.query.limit === "string" ? Math.min(Number.parseInt(req.query.limit, 10) || 50, 200) : 50;

  try {
    const result = await listTicketsForUser(req.authUser!.id, page, limit);
    res.status(200).json({ message: "Tickets retrieved.", data: result });
  } catch (error) {
    logger.error("Failed to list user tickets.", { requestId: req.requestId, error: serializeError(error) });
    res.status(500).json({ message: "Unable to retrieve tickets." });
  }
}

export async function getMyTicket(req: Request, res: Response): Promise<void> {
  const ticketId = req.params.ticketId;
  if (typeof ticketId !== "string" || ticketId.length === 0) {
    res.status(400).json({ message: "Ticket id is required." });
    return;
  }

  try {
    const ticket = await getTicketDetails(req.authUser!.id, ticketId);
    res.status(200).json({ message: "Ticket retrieved.", data: ticket });
  } catch (error) {
    logger.warn("Failed to retrieve ticket.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to retrieve ticket." });
  }
}

export async function cancelMyTicket(req: Request, res: Response): Promise<void> {
  const ticketId = req.params.ticketId;
  if (typeof ticketId !== "string" || ticketId.length === 0) {
    res.status(400).json({ message: "Ticket id is required." });
    return;
  }

  try {
    const result = await cancelTicket(req.authUser!.id, ticketId);
    res.status(200).json({ message: "Ticket cancelled.", data: result });
  } catch (error) {
    logger.warn("Failed to cancel ticket.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to cancel ticket." });
  }
}
