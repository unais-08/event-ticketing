import { Role, type User } from "@prisma/client";
import { type JwtPayload } from "jsonwebtoken";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
export type PublicUser = Pick<User, "id" | "name" | "email" | "role" | "createdAt">;
export interface AuthTokenPayload extends JwtPayload {
    email: string;
    name: string;
    role: Role;
}
export declare class AuthError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare function createAuthSession(user: PublicUser): {
    user: PublicUser;
    token: string;
    tokenType: "Bearer";
    expiresIn: NonNullable<number | import("ms").StringValue | undefined>;
};
export declare function verifyAuthToken(token: string): AuthTokenPayload & {
    sub: string;
};
export declare function extractBearerToken(authorizationHeader: string | undefined): string;
export declare function registerUser(input: RegisterInput): Promise<{
    user: PublicUser;
    token: string;
}>;
export declare function loginUser(input: LoginInput): Promise<{
    user: PublicUser;
    token: string;
}>;
export declare function getAuthenticatedUser(userId: string): Promise<PublicUser>;
//# sourceMappingURL=auth.service.d.ts.map