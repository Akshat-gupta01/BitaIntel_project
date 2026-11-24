import { sequelize } from "../config/database.js";
import { Role, Permission, RolePermission, User } from "../models/index.js";

export interface PermissionDefinition {
  code: string;
  module: string;
  action: "view" | "create" | "edit" | "delete" | "approve" | "respond" | "export";
  name: string;
  description: string;
}

// In-Memory Permission Cache for sub-millisecond evaluation
const permissionCache = new Map<string, Set<string>>();
// Role activation cache so suspended roles stop authorizing immediately after a change.
const roleActiveCache = new Map<string, boolean>();

const ALLOWED_ACTIONS = new Set(["view", "create", "edit", "delete", "approve", "respond", "export"]);

export class RbacService {
  static clearCache(roleCode?: string) {
    if (roleCode) {
      permissionCache.delete(roleCode);
      roleActiveCache.delete(roleCode);
    } else {
      permissionCache.clear();
      roleActiveCache.clear();
    }
  }

  static async isRoleActive(roleCode: string): Promise<boolean> {
    if (roleActiveCache.has(roleCode)) {
      return roleActiveCache.get(roleCode)!;
    }

    const role = await Role.findOne({
      where: { code: roleCode },
      attributes: ["isActive"],
    });

    const active = Boolean(role?.isActive);
    roleActiveCache.set(roleCode, active);
    return active;
  }

  /**
   * Normalizes incoming permission codes and rejects unknown codes instead of
   * silently dropping them (which previously made assignedCount misleading).
   */
  private static normalizePermissionCodes(codes: unknown): string[] {
    if (!Array.isArray(codes)) {
      throw new Error("permissionCodes must be an array of permission code strings.");
    }

    return Array.from(
      new Set(
        codes
          .map((code) => String(code ?? "").trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }

  private static assertAllPermissionsExist(requested: string[], found: string[]) {
    const foundSet = new Set(found);
    const unknown = requested.filter((code) => !foundSet.has(code));
    if (unknown.length > 0) {
      throw new Error(`Unknown permission code(s): ${unknown.join(", ")}`);
    }
  }

  static async getAllRolesWithPermissions() {
    const roles = await Role.findAll({
      order: [["id", "ASC"]],
      include: [
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
    });

    const userCounts = await User.findAll({
      attributes: [
        "role",
        [sequelize.fn("COUNT", sequelize.col("id")), "userCount"],
      ],
      group: ["role"],
      raw: true,
    }) as any[];

    const countMap = new Map<string, number>();
    userCounts.forEach((u: any) => {
      countMap.set(u.role, Number(u.userCount) || 0);
    });

    return roles.map((role) => {
      const isSuper = role.code === "super_admin";
      const permissions = (role as any).permissions || [];
      const userCount = countMap.get(role.code) || 0;

      return {
        id: role.id,
        code: role.code,
        name: role.name,
        label: role.label || role.name,
        description: role.description || "",
        isSystem: Boolean(role.isSystem),
        isActive: Boolean(role.isActive),
        isSuperAdmin: isSuper,
        userCount,
        permissionsCount: isSuper ? "All" : permissions.length,
        permissionCodes: permissions.map((p: any) => p.code),
        permissions,
      };
    });
  }

  static async getAllPermissionsCatalog() {
    const all = await Permission.findAll({
      order: [
        ["module", "ASC"],
        ["id", "ASC"],
      ],
    });

    const grouped: Record<string, Permission[]> = {};
    for (const p of all) {
      if (!grouped[p.module]) {
        grouped[p.module] = [];
      }
      grouped[p.module].push(p);
    }

    return {
      total: all.length,
      modules: grouped,
      catalog: all,
    };
  }

  static async createRole(data: {
    name: string;
    code: string;
    label?: string;
    description?: string;
    permissionCodes?: string[];
  }) {
    const normalizedCode = data.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const existing = await Role.findOne({ where: { code: normalizedCode } });
    if (existing) {
      throw new Error(`Role with code '${normalizedCode}' already exists.`);
    }

    const permissionCodes = this.normalizePermissionCodes(data.permissionCodes ?? []);
    const transaction = await sequelize.transaction();

    try {
      const newRole = await Role.create({
        name: data.name.trim(),
        code: normalizedCode,
        label: data.label || data.name.trim(),
        description: data.description || "Custom enterprise assigned role",
        isSystem: false,
        isActive: true,
      }, { transaction });

      if (permissionCodes.length > 0) {
        const perms = await Permission.findAll({
          where: { code: permissionCodes },
          transaction,
        });

        this.assertAllPermissionsExist(permissionCodes, perms.map((p) => p.code));
        await RolePermission.bulkCreate(
          perms.map((p) => ({ roleId: newRole.id, permissionId: p.id })),
          { transaction, ignoreDuplicates: true }
        );
      }

      await transaction.commit();
      this.clearCache(newRole.code);
      return newRole;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async createPermission(data: {
    code: string;
    module: string;
    action: string;
    name: string;
    description?: string;
  }) {
    const normalizedCode = data.code.trim().toLowerCase();
    if (!/^[a-z0-9_]+(\.[a-z0-9_]+)+$/.test(normalizedCode)) {
      throw new Error("Permission code must look like 'module.action' (lowercase letters, digits, underscores).");
    }

    const normalizedAction = data.action.trim().toLowerCase();
    if (!ALLOWED_ACTIONS.has(normalizedAction)) {
      throw new Error(`Unsupported permission action '${data.action}'. Allowed: ${Array.from(ALLOWED_ACTIONS).join(", ")}.`);
    }

    const existing = await Permission.findOne({ where: { code: normalizedCode } });
    if (existing) {
      throw new Error(`Permission code '${normalizedCode}' already exists.`);
    }

    const newPerm = await Permission.create({
      code: normalizedCode,
      module: data.module.trim(),
      action: normalizedAction,
      name: data.name.trim(),
      description: data.description || "",
    });

    this.clearCache();
    return newPerm;
  }

  static async updateRolePermissions(roleId: number, permissionCodes: string[]) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found.`);
    }

    if (role.code === "super_admin") {
      throw new Error("Super Admin role retains wildcard access and cannot be modified.");
    }

    if (!role.isActive) {
      throw new Error("Inactive roles cannot be modified. Activate the role first.");
    }

    const requestedCodes = this.normalizePermissionCodes(permissionCodes);
    const t = await sequelize.transaction();

    try {
      // Resolve and validate BEFORE destroying existing bindings, so an invalid
      // payload can never strip a role of all its permissions.
      const perms = requestedCodes.length > 0
        ? await Permission.findAll({
            where: { code: requestedCodes },
            transaction: t,
          })
        : [];

      this.assertAllPermissionsExist(requestedCodes, perms.map((p) => p.code));

      await RolePermission.destroy({ where: { roleId: role.id }, transaction: t });

      if (perms.length > 0) {
        await RolePermission.bulkCreate(
          perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
          { transaction: t, ignoreDuplicates: true }
        );
      }

      await t.commit();
      this.clearCache(role.code);

      return {
        roleId: role.id,
        roleCode: role.code,
        assignedCount: perms.length,
        permissionCodes: perms.map((p) => p.code),
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async updateRole(roleId: number, data: { name?: string; description?: string }) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found.`);
    }

    if (role.isSystem || role.code === "super_admin") {
      throw new Error("System roles cannot have their core definitions modified.");
    }

    if (data.name && data.name.trim()) {
      role.name = data.name.trim();
      role.label = data.name.trim();
    }
    if (data.description !== undefined) {
      role.description = data.description.trim();
    }

    await role.save();
    this.clearCache(role.code);
    return role;
  }

  static async deleteRole(roleId: number) {
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found.`);
    }

    if (role.isSystem || role.code === "super_admin") {
      throw new Error("System protected roles cannot be deleted.");
    }

    const t = await sequelize.transaction();
    try {
      await RolePermission.destroy({ where: { roleId: role.id }, transaction: t });
      await role.destroy({ transaction: t });
      await t.commit();
      this.clearCache(role.code);
      return { success: true, message: `Role '${role.name}' deleted successfully.` };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getUserEffectivePermissions(roleCode: string): Promise<string[]> {
    if (roleCode === "super_admin") {
      const all = await Permission.findAll({ attributes: ["code"] });
      return all.map((p) => p.code);
    }

    if (permissionCache.has(roleCode)) {
      return Array.from(permissionCache.get(roleCode)!);
    }

    const role = await Role.findOne({
      where: { code: roleCode },
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["code"],
          through: { attributes: [] },
        },
      ],
    });

    const codes = ((role as any)?.permissions || []).map((p: any) => p.code as string);
    permissionCache.set(roleCode, new Set(codes));
    return codes;
  }

  static async hasPermission(roleCode: string, requiredPermission: string): Promise<boolean> {
    if (roleCode === "super_admin") return true;

    if (!permissionCache.has(roleCode)) {
      await this.getUserEffectivePermissions(roleCode);
    }

    const set = permissionCache.get(roleCode);
    return set ? set.has(requiredPermission) : false;
  }
}

export default RbacService;
