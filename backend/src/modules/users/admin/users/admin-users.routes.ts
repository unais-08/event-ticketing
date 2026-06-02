import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth } from "../../../auth/auth.middleware.js";
import { requireRole } from "../../../auth/auth.middleware.js";
import { createChecker, createOrganizer, removeAttendee, removeChecker, removeOrganizer, retrieveUsers } from "./admin-users.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole(Role.ADMIN), retrieveUsers);

router.delete("/attendees/:userId", requireAuth, requireRole(Role.ADMIN), removeAttendee);

router.post("/organizers", requireAuth, requireRole(Role.ADMIN), createOrganizer);
router.delete("/organizers/:userId", requireAuth, requireRole(Role.ADMIN), removeOrganizer);

router.post("/checkers", requireAuth, requireRole(Role.ADMIN), createChecker);
router.delete("/checkers/:userId", requireAuth, requireRole(Role.ADMIN), removeChecker);

export default router;