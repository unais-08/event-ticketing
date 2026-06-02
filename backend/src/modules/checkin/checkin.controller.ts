import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import { logger, serializeError } from "../../config/logger.js";
import { generateTicketQrDataUrl, validateAndCheckin } from "./checkin.service.js";

/**
 * Return a QR code image (data URL) for the authenticated user's ticket.
 */
export async function getTicketQr(req: Request, res: Response): Promise<void> {
  const ticketId = req.params.ticketId;
  if (typeof ticketId !== "string" || ticketId.length === 0) {
    res.status(400).json({ message: "Ticket id is required." });
    return;
  }

  try {
    // verify ownership: only ticket owner, event organizer, or admin may request QR
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { event: true } });

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found." });
      return;
    }

    const userId = req.authUser!.id;
    const isOwner = ticket.userId === userId;
    const isOrganizer = ticket.event?.organizerId === userId;
    const isAdmin = req.authUser!.role === "ADMIN";

    if (!isOwner && !isOrganizer && !isAdmin) {
      res.status(403).json({ message: "Not authorized to access this ticket QR." });
      return;
    }

    const host = req.get("origin") ?? `${req.protocol}://${req.get("host")}`;
    const result = await generateTicketQrDataUrl(ticketId, host);
    res.status(200).json({ message: "QR generated.", data: result });
  } catch (error) {
    logger.error("Failed to generate QR.", { requestId: req.requestId, error: serializeError(error) });
    res.status(500).json({ message: "Unable to generate QR." });
  }
}

/**
 * Endpoint used by organizers/admins at check-in time.
 * The route verifies the token, checks authorization (organizer or admin), and marks ticket as checked-in.
 */
export async function checkinByToken(req: Request, res: Response): Promise<void> {
  const token = req.params.token || req.body?.token;

  if (!token || typeof token !== "string") {
    res.status(400).json({ message: "QR token is required." });
    return;
  }

  try {
    // allowAdmin flag: admins are permitted via middleware by passing in req.authUser
    const allowAdmin = req.authUser?.role === "ADMIN";
    const result = await validateAndCheckin(token, req.authUser!.id, allowAdmin);
    res.status(200).json({ message: "Check-in processed.", data: result });
  } catch (error) {
    logger.warn("Check-in failed.", { requestId: req.requestId, error: serializeError(error) });
    res.status(403).json({ message: (error as Error).message ?? "Unable to process check-in." });
  }
}
