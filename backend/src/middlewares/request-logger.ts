import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { requestLogStream } from "../config/logger.js";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function attachRequestId(req: Request, res: Response, next: NextFunction): void {
  const incomingRequestId = req.header("x-request-id")?.trim();
  const requestId = incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}

morgan.token("request-id", (req: Request) => req.requestId ?? "-" );
morgan.token("client-ip", (req: Request) => req.ip ?? req.socket.remoteAddress ?? "-" );

const httpLogPattern =
  '":method :url" :status :res[content-length] - :response-time ms';

export const httpLogger = morgan(httpLogPattern, {
  stream: requestLogStream,
  skip: () => process.env.NODE_ENV === "test",
});
