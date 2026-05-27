import express, {} from "express";
import prisma from "./config/prisma.js";
import { logger, serializeError } from "./config/logger.js";
import { attachRequestId, httpLogger } from "./middlewares/request-logger.js";
const app = express();
app.use(attachRequestId);
app.use(httpLogger);
app.use(express.json());
app.get("/", (_req, res) => {
    res.send({ message: "Express + TypeScript Server is running!" });
});
app.get("/api/health", async (req, res) => {
    try {
        await Promise.all([prisma.user.count()]);
        res.json({
            status: "ok",
            database: "connected",
        });
    }
    catch (error) {
        logger.error("Health check query failed.", {
            requestId: req.requestId,
            error: serializeError(error),
        });
        res.status(500).json({
            status: "error",
            database: "disconnected",
        });
    }
});
export default app;
//# sourceMappingURL=app.js.map