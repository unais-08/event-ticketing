import { Router } from "express";
import { requireAuth } from "../../auth/auth.middleware.js";
import {
  publicListEvents,
  publicGetEvent,
  purchaseTicketHandler,
  listMyTickets,
  getMyTicket,
  cancelMyTicket,
} from "./attendees.controller.js";

const router = Router();

// Public endpoints
router.get("/events", publicListEvents);
router.get("/events/:eventId", publicGetEvent);

// Authenticated attendee endpoints
router.post("/tickets", requireAuth, purchaseTicketHandler);
router.get("/tickets", requireAuth, listMyTickets);
router.get("/tickets/:ticketId", requireAuth, getMyTicket);
router.delete("/tickets/:ticketId", requireAuth, cancelMyTicket);
router.get("/tickets/:ticketId/qr", requireAuth, async (req, res, next) => {
  // delegate to checkin QR generator to avoid duplication
  // lazy import to prevent circular deps
  const { getTicketQr } = await import("../../checkin/checkin.controller.js");
  return getTicketQr(req, res, next as any);
});

export default router;
