import { Router } from "express";
import { login, me, register } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
import adminUsersRoutes from "../users/admin/users/admin-users.routes.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

router.use("/", adminUsersRoutes);

export default router;
