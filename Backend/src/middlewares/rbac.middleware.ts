import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse.js";
import { RbacService } from "../services/rbac.service.js";

/**
 * High performance RBAC Authorization Middleware
 * Evaluates module-wise permissions against database role assignments.
 * Super Admin retains universal wildcard bypass.
 */
export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, "Authentication required. Please sign in.", 401, "ERR_UNAUTHORIZED");
      }

      // 1. Super Admin Wildcard Bypass
      if (user.role === "super_admin") {
        return next();
      }

      // 2. Evaluates cached/DB effective permissions
      const allowed = await RbacService.hasPermission(user.role, requiredPermission);
      if (!allowed) {
        return sendError(
          res,
          `Access Denied: Your assigned role (${user.role}) does not possess the required permission [${requiredPermission}].`,
          403,
          "ERR_FORBIDDEN_PERMISSION"
        );
      }

      next();
    } catch (error) {
      console.error("[RBAC Middleware Error]:", error);
      return sendError(res, "Internal error validating role permissions", 500, "ERR_RBAC_INTERNAL");
    }
  };
}

export default authorize;
