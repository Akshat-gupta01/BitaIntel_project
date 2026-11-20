export interface Permission {
  id: number;
  code: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
  name: string;
  description: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  label: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  isSuperAdmin: boolean;
  userCount: number;
  permissionsCount: number | string;
  permissionCodes: string[];
  permissions: Permission[];
}

export interface PermissionsCatalogResponse {
  total: number;
  modules: Record<string, Permission[]>;
  catalog: Permission[];
}

export interface CreateRolePayload {
  name: string;
  code: string;
  label?: string;
  description?: string;
  permissionCodes?: string[];
}

export interface CreatePermissionPayload {
  code: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
  name: string;
  description?: string;
}

export interface UpdateRolePermissionsPayload {
  permissionCodes: string[];
}
