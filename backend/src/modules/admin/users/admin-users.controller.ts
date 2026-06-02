import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { logger, serializeError } from "../../../config/logger.js";
import { registerSchema } from "../../auth/auth.validation.js";
import {
	createOrganizerAccount,
	type AdminUsersError,
	deleteAttendeeAccount,
	deleteOrganizerAccount,
	retrieveUsers as retrieveUsersService,
} from "./admin-users.service.js";

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

function isAuthError(error: unknown): error is AdminUsersError {
	return typeof error === "object" && error !== null && "statusCode" in error && "message" in error;
}

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

function parsePositiveInteger(value: unknown, fallback: number): number {
	if (typeof value !== "string" || value.trim().length === 0) {
		return fallback;
	}

	const parsed = Number.parseInt(value, 10);

	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseRoleFilter(value: unknown): Role | undefined | null {
	if (typeof value !== "string" || value.trim().length === 0) {
		return undefined;
	}

	const normalized = value.trim().toUpperCase();

	return Object.values(Role).includes(normalized as Role) ? (normalized as Role) : null;
}

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