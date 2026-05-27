import type { NextFunction, Request, Response } from "express";
declare module "express-serve-static-core" {
    interface Request {
        requestId?: string;
    }
}
export declare function attachRequestId(req: Request, res: Response, next: NextFunction): void;
export declare const httpLogger: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse<import("node:http").IncomingMessage>, callback: (err?: Error) => void) => void;
//# sourceMappingURL=request-logger.d.ts.map