import { compare, hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import { logger } from "../../config/logger.js";
const SALT_ROUNDS = 12;
const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1d");
const JWT_ISSUER = "event-ticketing-api";
const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
};
const loginUserSelect = {
    ...publicUserSelect,
    password: true,
};
export class AuthError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.name = "AuthError";
        this.statusCode = statusCode;
    }
}
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set`);
    }
    return value;
}
function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
function createAuthToken(user) {
    return sign({
        email: user.email,
        name: user.name,
        role: user.role,
    }, JWT_SECRET, {
        subject: user.id,
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
    });
}
export function createAuthSession(user) {
    return {
        user: toPublicUser(user),
        token: createAuthToken(user),
        tokenType: "Bearer",
        expiresIn: JWT_EXPIRES_IN,
    };
}
export function verifyAuthToken(token) {
    const decoded = verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
    });
    if (typeof decoded === "string") {
        throw new AuthError("Invalid authentication token.", 401);
    }
    if (typeof decoded.sub !== "string" ||
        typeof decoded.email !== "string" ||
        typeof decoded.name !== "string" ||
        typeof decoded.role !== "string") {
        throw new AuthError("Invalid authentication token.", 401);
    }
    return decoded;
}
export function extractBearerToken(authorizationHeader) {
    if (!authorizationHeader) {
        throw new AuthError("Authorization header is required.", 401);
    }
    const [scheme, token, ...rest] = authorizationHeader.trim().split(/\s+/);
    if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
        throw new AuthError("Authorization header must use the Bearer scheme.", 401);
    }
    return token;
}
export async function registerUser(input) {
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
            role: Role.USER,
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
export async function loginUser(input) {
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
export async function getAuthenticatedUser(userId) {
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
//# sourceMappingURL=auth.service.js.map