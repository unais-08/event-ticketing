import express, { type Express, type Request, type Response } from "express";
import prisma from "./config/prisma.js";
import { logger, serializeError } from "./config/logger.js";
import { attachRequestId, httpLogger } from "./middlewares/request-logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminUsersRoutes from "./modules/users/admin/users/admin-users.routes.js";
const app: Express = express();

app.use(attachRequestId);
app.use(httpLogger);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUsersRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send({ message: "Express + TypeScript Server is running!" });
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const cnt=await Promise.all([prisma.user.count()]);

    res.json({
      status: "ok",
      database: "connected",
      userCount: cnt[0],
    });
  } catch (error) {
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
