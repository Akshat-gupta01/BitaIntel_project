import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { RbacService } from "../services/rbac.service.js";

export async function getMyPermissions(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, "User not authenticated", 401, "ERR_UNAUTHORIZED");
    }

    const permissions = await RbacService.getUserEffectivePermissions(user.role);
    return sendSuccess(res, {
      userId: user.id,
      role: user.role,
      isSuperAdmin: user.role === "super_admin",
      permissions,
    });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch permissions", 500, "ERR_RBAC_FETCH");
  }
}

export async function getAllRoles(req: Request, res: Response) {
  try {
    const roles = await RbacService.getAllRolesWithPermissions();
    return sendSuccess(res, roles);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch roles", 500, "ERR_ROLES_FETCH");
  }
}

export async function getAllPermissionsCatalog(req: Request, res: Response) {
  try {
    const catalog = await RbacService.getAllPermissionsCatalog();
    return sendSuccess(res, catalog);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch permissions catalog", 500, "ERR_CATALOG_FETCH");
  }
}

export async function createCustomRole(req: Request, res: Response) {
  try {
    const { name, code, label, description, permissionCodes } = req.body;
    if (!name || !code) {
      return sendError(res, "Role name and unique code are required", 400, "ERR_VALIDATION");
    }

    const newRole = await RbacService.createRole({
      name,
      code,
      label,
      description,
      permissionCodes,
    });

    return sendSuccess(res, newRole, 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create custom role", 400, "ERR_ROLE_CREATE");
  }
}

export async function createCustomPermission(req: Request, res: Response) {
  try {
    const { code, module, action, name, description } = req.body;
    if (!code || !module || !action || !name) {
      return sendError(res, "code, module, action, and name are required", 400, "ERR_VALIDATION");
    }

    const newPerm = await RbacService.createPermission({
      code,
      module,
      action,
      name,
      description,
    });

    return sendSuccess(res, newPerm, 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create permission", 400, "ERR_PERMISSION_CREATE");
  }
}

export async function updateRolePermissions(req: Request, res: Response) {
  try {
    const roleId = Number(req.params.roleId);
    const { permissionCodes } = req.body;

    if (!roleId || isNaN(roleId)) {
      return sendError(res, "Valid roleId is required", 400, "ERR_INVALID_ROLE_ID");
    }

    if (!Array.isArray(permissionCodes)) {
      return sendError(res, "permissionCodes must be an array of strings", 400, "ERR_INVALID_PAYLOAD");
    }

    const result = await RbacService.updateRolePermissions(roleId, permissionCodes);
    return sendSuccess(res, result);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update role permissions", 500, "ERR_ROLE_UPDATE");
  }
}
