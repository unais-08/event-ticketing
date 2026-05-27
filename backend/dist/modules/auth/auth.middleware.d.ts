import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { type PublicUser } from "./auth.service.js";
declare module "express-serve-static-core" {
    interface Request {
        requestId?: string;
        authUser?: PublicUser;
    }
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(...allowedRoles: Role[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map