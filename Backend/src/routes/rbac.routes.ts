import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize, requireRole } from "../middlewares/rbac.middleware.js";
import {
  getMyPermissions,
  getAllRoles,
  getAllPermissionsCatalog,
  createCustomRole,
  createCustomPermission,
  updateRolePermissions,
  updateRole,
  deleteRole,
} from "../controllers/rbac.controller.js";

const router = Router();

// Authentication required for all RBAC endpoints
router.use(authenticate);

// 1. Current user effective permissions (accessible to any authenticated account)
router.get("/my-permissions", getMyPermissions);

// ─── Super Admin & Platform Admin Access Required for RBAC Administration ──
router.use(requireRole("super_admin", "admin", "verification_officer"));

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

// 7. Update custom role details
router.put("/roles/:roleId", authorize("users.edit"), updateRole);

// 8. Delete custom role
router.delete("/roles/:roleId", authorize("users.edit"), deleteRole);

export default router;
