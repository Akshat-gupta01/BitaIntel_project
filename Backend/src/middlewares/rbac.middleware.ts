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

      // 0. A deactivated role must stop granting access immediately.
      if (!(await RbacService.isRoleActive(user.role))) {
        return sendError(
          res,
          `Access Denied: Your assigned role (${user.role}) is inactive.`,
          403,
          "ERR_FORBIDDEN_ROLE_INACTIVE"
        );
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

/**
 * Restricts a route group to specific role codes (e.g. vendor self-service).
 * Super Admin keeps its documented wildcard access; every other role must match.
 * Role activation is enforced so suspended roles cannot exercise these routes.
 */
export function requireRole(...allowedRoles: string[]) {
  const normalized = new Set(allowedRoles.map((role) => role.toLowerCase()));

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return sendError(res, "Authentication required. Please sign in.", 401, "ERR_UNAUTHORIZED");
      }

      if (!(await RbacService.isRoleActive(user.role))) {
        return sendError(
          res,
          `Access Denied: Your assigned role (${user.role}) is inactive.`,
          403,
          "ERR_FORBIDDEN_ROLE_INACTIVE"
        );
      }

      if (user.role === "super_admin" || normalized.has(user.role.toLowerCase())) {
        return next();
      }

      return sendError(
        res,
        `Access Denied: This area is restricted to ${Array.from(normalized).join(", ")} accounts.`,
        403,
        "ERR_FORBIDDEN_ROLE"
      );
    } catch (error) {
      console.error("[RBAC requireRole Error]:", error);
      return sendError(res, "Internal error validating role access", 500, "ERR_RBAC_INTERNAL");
    }
  };
}

export default authorize;
