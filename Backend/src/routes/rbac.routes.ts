import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/rbac.middleware.js";
import {
  getMyPermissions,
  getAllRoles,
  getAllPermissionsCatalog,
  createCustomRole,
  createCustomPermission,
  updateRolePermissions,
} from "../controllers/rbac.controller.js";

const router = Router();

// Authentication required for all RBAC endpoints
router.use(authenticate);

// 1. Current user effective permissions
router.get("/my-permissions", getMyPermissions);

// 2. Roles list with assigned permissions & user counts
router.get("/roles", authorize("users.view"), getAllRoles);

// 3. Permissions catalog grouped by module
router.get("/permissions", authorize("users.view"), getAllPermissionsCatalog);

// 4. Create new dynamic role
router.post("/roles", authorize("users.edit"), createCustomRole);

// 5. Create new dynamic permission
router.post("/permissions", authorize("users.edit"), createCustomPermission);

// 6. Update permission matrix for a role
router.put("/roles/:roleId/permissions", authorize("users.edit"), updateRolePermissions);

export default router;
