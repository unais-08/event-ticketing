import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import { logger, serializeError } from "./config/logger.js";
import { attachRequestId, httpLogger } from "./middlewares/request-logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminUsersRoutes from "./modules/users/admin/users/admin-users.routes.js";
import organizersRoutes from "./modules/users/organizers/organizers.routes.js";
import attendeesRoutes from "./modules/users/attendees/attendees.routes.js";
import checkinRoutes from "./modules/checkin/checkin.routes.js";
const app: Express = express();

app.use(attachRequestId);
app.use(httpLogger);
app.use(express.json());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/organizers", organizersRoutes);
app.use("/api/attendees", attendeesRoutes);
app.use("/api/checkin", checkinRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send({ message: "Express + TypeScript Server is running!" });
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const cnt = await Promise.all([prisma.user.count()]);

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
