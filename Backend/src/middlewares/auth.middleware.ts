import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { sendError } from "../utils/apiResponse.js";
import { User } from "../models/index.js";

// Express ke Request object me 'user' field ko allow karta hai
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Token nikalte hain (Cookie se ya Authorization Header se)
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return sendError(res, "Please login first", 401, "ERR_UNAUTHORIZED");
    }

    // 2. Token verify karein
    const decoded = verifyToken<{ userId: number }>(token);
    if (!decoded?.userId) {
      return sendError(res, "Invalid or expired session", 401, "ERR_INVALID_TOKEN");
    }

    // 3. Database me active user check karein
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== "ACTIVE") {
      return sendError(res, "User account not found or suspended", 401, "ERR_ACCOUNT_INACTIVE");
    }

    // 4. User attach karein aur aage jane dein
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Authentication failed", 500, "ERR_INTERNAL_SERVER");
  }
}

/**
 * Optional authentication middleware for public/semi-public endpoints.
 * Attaches req.user when a valid active session token is provided, and
 * falls through as an anonymous visitor otherwise.
 */
export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    const decoded = verifyToken<{ userId: number }>(token);
    if (!decoded?.userId) return next();

    const user = await User.findByPk(decoded.userId);
    if (user && user.status === "ACTIVE") {
      req.user = user;
    }
  } catch {
    // Treat invalid/expired tokens on public routes as unauthenticated visitors
  }
  return next();
}
