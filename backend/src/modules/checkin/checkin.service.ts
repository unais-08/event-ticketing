import jwt, { type SignOptions } from "jsonwebtoken";
import QRCode from "qrcode";
import prisma from "../../config/prisma.js";
import { logger } from "../../config/logger.js";

const QR_SECRET = process.env.QR_SECRET ?? process.env.JWT_SECRET;
const QR_EXPIRES_IN = (process.env.QR_EXPIRES_IN ?? "24h") as NonNullable<SignOptions["expiresIn"]>;

if (!QR_SECRET) {
  throw new Error("QR_SECRET or JWT_SECRET must be set in environment to sign QR tokens");
}

/**
 * Generate a signed token for a ticket and return a QR image Data URL.
 * Strategy: use a signed JWT containing `ticketId` and short expiry, embed as URL.
 * This prevents forging while keeping the check-in flow simple.
 */
export async function generateTicketQrDataUrl(ticketId: string, hostUrl = "https://example.com") {
  const token = jwt.sign({ ticketId }, QR_SECRET!, { expiresIn: QR_EXPIRES_IN });

  const checkinUrl = `${hostUrl.replace(/\/$/, "")}/api/checkin/${token}`;

  const dataUrl = await QRCode.toDataURL(checkinUrl, { errorCorrectionLevel: "M", width: 300 });

  return { token, dataUrl };
}

/**
 * Validate a QR token and mark the ticket as checked in.
 * Only the event's organizer, a checker, or an admin should be allowed to perform check-in.
 */
export async function validateAndCheckin(token: string, requesterId: string, canBypassOwnership = false) {
  let payload: any;

  try {
    payload = jwt.verify(token, QR_SECRET!) as unknown as { ticketId: string };
  } catch (err) {
    throw new Error("Invalid or expired QR token");
  }

  if (!payload || typeof payload.ticketId !== "string") {
    throw new Error("Invalid QR token payload");
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: payload.ticketId }, include: { event: true } });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Only organizer of the event or admin may check attendees in
  const event = ticket.event;

  if (!event) {
    throw new Error("Related event not found");
  }

  const organizer = await prisma.user.findUnique({ where: { id: event.organizerId }, select: { id: true, role: true } });

  if (!organizer) {
    throw new Error("Event organizer not found");
  }

  if (!canBypassOwnership && requesterId !== organizer.id) {
    throw new Error("Not authorized to check in this ticket");
  }

  if (ticket.checkedIn) {
    return { alreadyCheckedIn: true, ticketId: ticket.id };
  }

  const updated = await prisma.ticket.update({ where: { id: ticket.id }, data: { checkedIn: true } });

  logger.info("Ticket checked in.", { ticketId: ticket.id, eventId: event.id, checkedInBy: requesterId });

  return { alreadyCheckedIn: false, ticket: updated };
}
