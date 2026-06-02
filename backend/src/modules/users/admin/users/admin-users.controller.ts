import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { logger, serializeError } from "../../../../config/logger.js";
import { registerSchema } from "../../../auth/auth.validation.js";
import {
	createOrganizerAccount,
	createCheckerAccount,
	type AdminUsersError,
	deleteAttendeeAccount,
	deleteCheckerAccount,
	deleteOrganizerAccount,
	retrieveUsers as retrieveUsersService,
} from "./admin-users.service.js";

/**
 * Centralized error handling for admin user controller actions.
 * Maps domain errors to appropriate HTTP responses and logs unexpected failures.
 */
function handleAdminUserError(res: Response, requestId: string | undefined, error: unknown, action: string): void {
	if (isAuthError(error)) {
		logger.warn(`Admin user ${action} failed.`, {
			requestId,
			message: error.message,
			statusCode: error.statusCode,
		});

		res.status(error.statusCode).json({
			message: error.message,
		});

		return;
	}

	logger.error(`Admin user ${action} failed unexpectedly.`, {
		requestId,
		error: serializeError(error),
	});

	res.status(500).json({
		message: "Something went wrong while processing the admin request.",
	});
}

/**
 * Narrowing helper to detect `AdminUsersError` shape returned by service functions.
 */
function isAuthError(error: unknown): error is AdminUsersError {
	return typeof error === "object" && error !== null && "statusCode" in error && "message" in error;
}

/**
 * GET /api/admin/users
 * Query params: `page`, `limit`, optional `role` to filter.
 */
export async function retrieveUsers(req: Request, res: Response): Promise<void> {
	const page = parsePositiveInteger(req.query.page, 1);
	const limit = Math.min(parsePositiveInteger(req.query.limit, 20), 100);
	const role = parseRoleFilter(req.query.role);

	if (role === null) {
		res.status(400).json({
			message: "Invalid role filter.",
		});

		return;
	}

	try {
		const result = await retrieveUsersService(
			role === undefined ? { page, limit } : { page, limit, role },
		);

		res.status(200).json({
			message: "Users retrieved successfully.",
			data: result,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "user retrieval");
	}
}

/**
 * Parse a positive integer from a query value, with a fallback.
 */
function parsePositiveInteger(value: unknown, fallback: number): number {
	if (typeof value !== "string" || value.trim().length === 0) {
		return fallback;
	}

	const parsed = Number.parseInt(value, 10);

	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Parse role filter from query string. Returns `undefined` when omitted,
 * the Role value when valid, or `null` when the provided value is invalid.
 */
function parseRoleFilter(value: unknown): Role | undefined | null {
	if (typeof value !== "string" || value.trim().length === 0) {
		return undefined;
	}

	const normalized = value.trim().toUpperCase();

	return Object.values(Role).includes(normalized as Role) ? (normalized as Role) : null;
}

/**
 * POST /api/admin/users/organizers
 * Creates an organizer account from the admin panel.
 */
export async function createOrganizer(req: Request, res: Response): Promise<void> {
	const parsedBody = registerSchema.safeParse(req.body);

	if (!parsedBody.success) {
		logger.warn("Organizer creation validation failed.", {
			requestId: req.requestId,
			issues: parsedBody.error.flatten().fieldErrors,
		});

		res.status(400).json({
			message: "Validation failed.",
			errors: parsedBody.error.flatten().fieldErrors,
		});

		return;
	}

	try {
		const session = await createOrganizerAccount(parsedBody.data);

		res.status(201).json({
			message: "Organizer account created successfully.",
			data: session,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "organizer creation");
	}
}

/**
 * DELETE /api/admin/users/organizers/:userId
 * Deletes an organizer and all related resources.
 */
export async function removeOrganizer(req: Request, res: Response): Promise<void> {
	const organizerId = req.params.userId;

	if (typeof organizerId !== "string" || organizerId.length === 0) {
		res.status(400).json({
			message: "Organizer id is required.",
		});

		return;
	}

	try {
		const summary = await deleteOrganizerAccount(organizerId);

		res.status(200).json({
			message: "Organizer deleted successfully.",
			data: summary,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "organizer deletion");
	}
}

/**
 * DELETE /api/admin/users/attendees/:userId
 * Deletes an attendee and their tickets.
 */
export async function removeAttendee(req: Request, res: Response): Promise<void> {
	const attendeeId = req.params.userId;

	if (typeof attendeeId !== "string" || attendeeId.length === 0) {
		res.status(400).json({
			message: "Attendee id is required.",
		});

		return;
	}

	try {
		const summary = await deleteAttendeeAccount(attendeeId);

		res.status(200).json({
			message: "Attendee deleted successfully.",
			data: summary,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "attendee deletion");
	}
}

/**
 * POST /api/admin/users/checkers
 * Creates a checker account from the admin panel.
 */
export async function createChecker(req: Request, res: Response): Promise<void> {
	const parsedBody = registerSchema.safeParse(req.body);

	if (!parsedBody.success) {
		logger.warn("Checker creation validation failed.", {
			requestId: req.requestId,
			issues: parsedBody.error.flatten().fieldErrors,
		});

		res.status(400).json({
			message: "Validation failed.",
			errors: parsedBody.error.flatten().fieldErrors,
		});

		return;
	}

	try {
		const session = await createCheckerAccount(parsedBody.data);

		res.status(201).json({
			message: "Checker account created successfully.",
			data: session,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "checker creation");
	}
}

/**
 * DELETE /api/admin/users/checkers/:userId
 * Deletes a checker account.
 */
export async function removeChecker(req: Request, res: Response): Promise<void> {
	const checkerId = req.params.userId;

	if (typeof checkerId !== "string" || checkerId.length === 0) {
		res.status(400).json({
			message: "Checker id is required.",
		});

		return;
	}

	try {
		const summary = await deleteCheckerAccount(checkerId);

		res.status(200).json({
			message: "Checker deleted successfully.",
			data: summary,
		});
	} catch (error) {
		handleAdminUserError(res, req.requestId, error, "checker deletion");
	}
}