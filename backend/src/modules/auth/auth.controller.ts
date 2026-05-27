import type { Request, Response } from "express";
import { logger, serializeError } from "../../config/logger.js";
import { type AuthError, loginUser, registerUser } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

function handleAuthError(res: Response, requestId: string | undefined, error: unknown, action: string): void {
	if (isAuthError(error)) {
		logger.warn(`Auth ${action} failed.`, {
			requestId,
			message: error.message,
			statusCode: error.statusCode,
		});

		res.status(error.statusCode).json({
			message: error.message,
		});

		return;
	}

	logger.error(`Auth ${action} failed unexpectedly.`, {
		requestId,
		error: serializeError(error),
	});

	res.status(500).json({
		message: "Something went wrong while processing the authentication request.",
	});
}

function isAuthError(error: unknown): error is AuthError {
	return typeof error === "object" && error !== null && "statusCode" in error && "message" in error;
}

export async function register(req: Request, res: Response): Promise<void> {
	const parsedBody = registerSchema.safeParse(req.body);

	if (!parsedBody.success) {
		logger.warn("Auth registration validation failed.", {
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
		const session = await registerUser(parsedBody.data);

		res.status(201).json({
			message: "Account created successfully.",
			data: session,
		});
	} catch (error) {
		handleAuthError(res, req.requestId, error, "registration");
	}
}

export async function login(req: Request, res: Response): Promise<void> {
	const parsedBody = loginSchema.safeParse(req.body);

	if (!parsedBody.success) {
		logger.warn("Auth login validation failed.", {
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
		const session = await loginUser(parsedBody.data);

		res.status(200).json({
			message: "Login successful.",
			data: session,
		});
	} catch (error) {
		handleAuthError(res, req.requestId, error, "login");
	}
}

export async function me(req: Request, res: Response): Promise<void> {
	if (!req.authUser) {
		res.status(401).json({
			message: "Authentication is required.",
		});

		return;
	}

	logger.debug("Auth profile retrieved.", {
		requestId: req.requestId,
		userId: req.authUser.id,
	});

	res.status(200).json({
		message: "Profile retrieved successfully.",
		data: {
			user: req.authUser,
		},
	});
}
