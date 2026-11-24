import api from "../utils/axios";
import type {
  Role,
  Permission,
  PermissionsCatalogResponse,
  CreateRolePayload,
  CreatePermissionPayload,
} from "../src/types/rbac.types";

export type {
  Role,
  Permission,
  PermissionsCatalogResponse,
  CreateRolePayload,
  CreatePermissionPayload,
};

export interface MyPermissionsResponse {
  userId: number;
  role: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

export interface UpdateRolePermissionsResponse {
  roleId: number;
  roleCode: string;
  assignedCount: number;
  permissionCodes: string[];
}

export async function getMyPermissions(): Promise<MyPermissionsResponse> {
  const res = await api.get<{ success: boolean; data: MyPermissionsResponse }>("/rbac/my-permissions");
  return res.data.data;
}

export async function getAllRoles(): Promise<Role[]> {
  const res = await api.get<{ success: boolean; data: Role[] }>("/rbac/roles");
  return res.data.data;
}

export async function getAllPermissions(): Promise<PermissionsCatalogResponse> {
  const res = await api.get<{ success: boolean; data: PermissionsCatalogResponse }>("/rbac/permissions");
  return res.data.data;
}

export async function createCustomRole(payload: CreateRolePayload): Promise<Role> {
  const res = await api.post<{ success: boolean; data: Role }>("/rbac/roles", payload);
  return res.data.data;
}

export async function createCustomPermission(payload: CreatePermissionPayload): Promise<Permission> {
  const res = await api.post<{ success: boolean; data: Permission }>("/rbac/permissions", payload);
  return res.data.data;
}

export async function updateRolePermissions(
  roleId: number,
  permissionCodes: string[]
): Promise<UpdateRolePermissionsResponse> {
  const res = await api.put<{ success: boolean; data: UpdateRolePermissionsResponse }>(
    `/rbac/roles/${roleId}/permissions`,
    {
      permissionCodes,
    }
  );
  return res.data.data;
}

export async function updateCustomRole(
  roleId: number,
  payload: { name?: string; description?: string }
): Promise<Role> {
  const res = await api.put<{ success: boolean; data: Role }>(`/rbac/roles/${roleId}`, payload);
  return res.data.data;
}

export async function deleteCustomRole(roleId: number): Promise<{ success: boolean; message: string }> {
  const res = await api.delete<{ success: boolean; message: string }>(`/rbac/roles/${roleId}`);
  return res.data;
}

const rbacService = {
  getMyPermissions,
  getAllRoles,
  getAllPermissions,
  createCustomRole,
  updateCustomRole,
  deleteCustomRole,
  createCustomPermission,
  updateRolePermissions,
};

export default rbacService;
