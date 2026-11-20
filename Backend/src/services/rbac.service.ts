import { sequelize } from "../config/database.js";
import { Role, Permission, RolePermission, User } from "../models/index.js";

export interface PermissionDefinition {
  code: string;
  module: string;
  action: "view" | "create" | "edit" | "delete" | "approve" | "export";
  name: string;
  description: string;
}

// In-Memory Permission Cache for sub-millisecond evaluation
const permissionCache = new Map<string, Set<string>>();

export class RbacService {
  static clearCache(roleCode?: string) {
    if (roleCode) {
      permissionCache.delete(roleCode);
    } else {
      permissionCache.clear();
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

    const newRole = await Role.create({
      name: data.name.trim(),
      code: normalizedCode,
      label: data.label || data.name.trim(),
      description: data.description || "Custom enterprise assigned role",
      isSystem: false,
      isActive: true,
    });

    if (Array.isArray(data.permissionCodes) && data.permissionCodes.length > 0) {
      const perms = await Permission.findAll({
        where: { code: data.permissionCodes },
      });
      const bindings = perms.map((p) => ({
        roleId: newRole.id,
        permissionId: p.id,
      }));
      if (bindings.length > 0) {
        await RolePermission.bulkCreate(bindings, { ignoreDuplicates: true });
      }
    }

    this.clearCache(newRole.code);
    return newRole;
  }

  static async createPermission(data: {
    code: string;
    module: string;
    action: string;
    name: string;
    description?: string;
  }) {
    const normalizedCode = data.code.trim().toLowerCase();
    const existing = await Permission.findOne({ where: { code: normalizedCode } });
    if (existing) {
      throw new Error(`Permission code '${normalizedCode}' already exists.`);
    }

    const newPerm = await Permission.create({
      code: normalizedCode,
      module: data.module.trim(),
      action: data.action.trim().toLowerCase(),
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

    const t = await sequelize.transaction();
    try {
      await RolePermission.destroy({ where: { roleId: role.id }, transaction: t });

      if (permissionCodes.length > 0) {
        const perms = await Permission.findAll({
          where: { code: permissionCodes },
          transaction: t,
        });

        const rows = perms.map((p) => ({
          roleId: role.id,
          permissionId: p.id,
        }));

        if (rows.length > 0) {
          await RolePermission.bulkCreate(rows, { transaction: t, ignoreDuplicates: true });
        }
      }

      await t.commit();
      this.clearCache(role.code);

      return {
        roleId: role.id,
        roleCode: role.code,
        assignedCount: permissionCodes.length,
        permissionCodes,
      };
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
