import { randomUUID } from "node:crypto";
import morgan from "morgan";
import { requestLogStream } from "../config/logger.js";
export function attachRequestId(req, res, next) {
    const incomingRequestId = req.header("x-request-id")?.trim();
    const requestId = incomingRequestId && incomingRequestId.length > 0 ? incomingRequestId : randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
}
morgan.token("request-id", (req) => req.requestId ?? "-");
morgan.token("client-ip", (req) => req.ip ?? req.socket.remoteAddress ?? "-");
const httpLogPattern = '":method :url" :status :res[content-length] - :response-time ms';
export const httpLogger = morgan(httpLogPattern, {
    stream: requestLogStream,
    skip: () => process.env.NODE_ENV === "test",
});
//# sourceMappingURL=request-logger.js.map