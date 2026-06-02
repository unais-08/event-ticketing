import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { Role } from "@prisma/client";
import {
  listEvents,
  createNewEvent,
  getEvent,
  updateExistingEvent,
  removeEvent,
  getEventTickets,
} from "./organizers.controller.js";

const router = Router();

// All organizer routes require authentication and organizer (or admin) role.
router.use(requireAuth, requireRole(Role.ORGANIZER, Role.ADMIN));

router.get("/events", listEvents);
router.post("/events", createNewEvent);
router.get("/events/:eventId", getEvent);
router.put("/events/:eventId", updateExistingEvent);
router.delete("/events/:eventId", removeEvent);
router.get("/events/:eventId/tickets", getEventTickets);

export default router;
