import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { Role } from "@prisma/client";
import { getTicketQr, checkinByToken } from "./checkin.controller.js";

const router = Router();

// Generate QR for a ticket - owner or admin/organizer may request
router.get("/tickets/:ticketId/qr", requireAuth, getTicketQr);

// Check-in by token - organizer, checker, or admin may perform check-in
router.post("/:token", requireAuth, requireRole(Role.ORGANIZER, Role.CHECKER, Role.ADMIN), checkinByToken);

export default router;
