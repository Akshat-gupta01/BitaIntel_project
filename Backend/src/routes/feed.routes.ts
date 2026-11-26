import { Router } from "express";
import { createFeedPost, deleteFeedPost, getPublicFeed } from "../controllers/feed.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const feedRouter = Router();

// Public intelligence feed (GET /api/v1/feed)
feedRouter.get("/", getPublicFeed);

// Admin-only feed publishing
feedRouter.post("/", authenticate, requireRole("super_admin", "admin"), createFeedPost);
feedRouter.delete("/:id", authenticate, requireRole("super_admin", "admin"), deleteFeedPost);

export default feedRouter;
