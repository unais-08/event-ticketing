import { compare, hash } from "bcryptjs";
import { Role, type User } from "@prisma/client";
import { type JwtPayload, type SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import { logger } from "../../config/logger.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

/**
 * Number of salt rounds used by bcrypt when hashing passwords.
 * Higher values increase security but also CPU cost.
 */
const SALT_ROUNDS = 12;

/**
 * JWT configuration values. `JWT_SECRET` is required and loaded from
 * environment variables. `JWT_EXPIRES_IN` can be overridden by env.
 */
const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1d") as NonNullable<SignOptions["expiresIn"]>;
const JWT_ISSUER = "event-ticketing-api";

/**
 * Prisma select objects used to limit which user fields are returned from the DB.
 * - `publicUserSelect` omits sensitive fields like `password`.
 * - `loginUserSelect` includes `password` because it's needed for authentication.
 */
const publicUserSelect = {
	id: true,
	name: true,
	email: true,
	role: true,
	createdAt: true,
} as const;

const loginUserSelect = {
	...publicUserSelect,
	password: true,
} as const;

/**
 * Public shape of a user returned by the auth APIs.
 */
export type PublicUser = Pick<User, "id" | "name" | "email" | "role" | "createdAt">;

/**
 * Additional properties included in our JWT payload.
 */
export interface AuthTokenPayload extends JwtPayload {
	email: string;
	name: string;
	role: Role;
}

/**
 * Custom error used throughout the auth module that includes an HTTP status code.
 */
export class AuthError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "AuthError";
		this.statusCode = statusCode;
	}
}

/**
 * Helper to read a required environment variable and throw a descriptive error
 * if it's missing. Used at startup for required secrets.
 */
function getRequiredEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is not set`);
	}

	return value;
}

/**
 * Convert a `PublicUser` object into the explicit shape returned to clients.
 * This function exists to centralize any future transformations.
 */
function toPublicUser(user: PublicUser): PublicUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
	};
}

/**
 * Create a signed JWT for a user.
 * The token includes a small payload (email, name, role) and sets `sub` to the user id.
 */
function createAuthToken(user: PublicUser): string {
	return jwt.sign(
		{
			email: user.email,
			name: user.name,
			role: user.role,
		},
		JWT_SECRET,
		{
			subject: user.id,
			expiresIn: JWT_EXPIRES_IN,
			issuer: JWT_ISSUER,
		},
	);
}

/**
 * Build an auth session object returned after successful registration/login.
 */
export function createAuthSession(user: PublicUser) {
	return {
		user: toPublicUser(user),
		token: createAuthToken(user),
		tokenType: "Bearer" as const,
		expiresIn: JWT_EXPIRES_IN,
	};
}

/**
 * Verify a JWT and return its payload with a `sub` (subject) field.
 * Throws `AuthError` for invalid tokens.
 */
export function verifyAuthToken(token: string): AuthTokenPayload & { sub: string } {
	const decoded = jwt.verify(token, JWT_SECRET, {
		issuer: JWT_ISSUER,
	});

	if (typeof decoded === "string") {
		throw new AuthError("Invalid authentication token.", 401);
	}

	// Ensure the expected fields are present on the decoded payload.
	if (
		typeof decoded.sub !== "string" ||
		typeof decoded.email !== "string" ||
		typeof decoded.name !== "string" ||
		typeof decoded.role !== "string"
	) {
		throw new AuthError("Invalid authentication token.", 401);
	}

	return decoded as unknown as AuthTokenPayload & { sub: string };
}

/**
 * Extract the Bearer token string from an Authorization header value.
 * Validates that the header uses the `Bearer` scheme and contains only the token.
 */
export function extractBearerToken(authorizationHeader: string | undefined): string {
	if (!authorizationHeader) {
		throw new AuthError("Authorization header is required.", 401);
	}

	const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);

	if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
		throw new AuthError("Authorization header must use the Bearer scheme.", 401);
	}

	return token;
}


/**
 * Register a new attendee user.
 * - Checks for existing user by email
 * - Hashes the password
 * - Creates the user record with the attendee role
 * - Returns an auth session (user + token)
 */
export async function registerUser(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
	const existingUser = await prisma.user.findUnique({
		where: {
			email: input.email,
		},
	});

	if (existingUser) {
		logger.warn("Auth registration blocked: email already exists.", {
			email: input.email,
			userId: existingUser.id,
		});
		throw new AuthError("Email is already registered.", 409);
	}

	const passwordHash = await hash(input.password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			password: passwordHash,
			role: Role.ATTENDEE,
		},
		select: publicUserSelect,
	});

	logger.info("Auth registration completed.", {
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	return createAuthSession(user);
}

/**
 * Authenticate a user by email + password and return an auth session.
 */
export async function loginUser(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
	const user = await prisma.user.findUnique({
		where: {
			email: input.email,
		},
		select: loginUserSelect,
	});

	if (!user) {
		logger.warn("Auth login blocked: user not found.", {
			email: input.email,
		});
		throw new AuthError("Invalid email or password.", 401);
	}

	const passwordMatches = await compare(input.password, user.password);

	if (!passwordMatches) {
		logger.warn("Auth login blocked: password mismatch.", {
			userId: user.id,
			email: user.email,
		});
		throw new AuthError("Invalid email or password.", 401);
	}

	logger.info("Auth login completed.", {
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	return createAuthSession(user);
}

/**
 * Fetch the authenticated user record by id and return the public view.
 */
export async function getAuthenticatedUser(userId: string): Promise<PublicUser> {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: publicUserSelect,
	});

	if (!user) {
		throw new AuthError("Authenticated user was not found.", 401);
	}

	return toPublicUser(user);
}
