'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  Save,
  RotateCcw,
  Lock,
  Loader2,
  AlertCircle,
  X,
  Search,
  Filter,
  Users,
  Key,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import type { Role, Permission } from '@/types/rbac.types';
import {
  getAllRoles,
  getAllPermissions,
  updateRolePermissions,
  createCustomRole,
  updateCustomRole,
  deleteCustomRole,
  createCustomPermission,
} from '@services/rbac.service';

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
    if (errorObj.response?.data?.message) return errorObj.response.data.message;
    if (errorObj.message) return errorObj.message;
  }
  return fallback;
}

export type ActionVerb = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'respond' | 'export';

export interface ModuleSlotConfig {
  id: string;
  name: string;
  sub: string;
  slots: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    approve?: boolean;
    respond?: boolean;
    export?: boolean;
  };
  customActionLabels?: Partial<Record<ActionVerb, string>>;
  vendorRestricted?: boolean;
}

const DEFAULT_MODULE_CONFIGS: ModuleSlotConfig[] = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    sub: 'Platform summary, executive KPIs & turnaround analytics',
    slots: { view: true, export: true },
  },
  {
    id: 'Users',
    name: 'Users',
    sub: 'Platform accounts, internal officers & staff invitations',
    slots: { view: true, create: true, edit: true, delete: true, export: true },
  },
  {
    id: 'Vendors',
    name: 'Vendors',
    sub: 'Supplier profiles, statutory onboarding & commercial listings',
    slots: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  },
  {
    id: 'Business Profile',
    name: 'Business Profile',
    sub: 'Corporate trade identity, manufacturing plants & contact cards',
    slots: { view: true, edit: true },
  },
  {
    id: 'Verification',
    name: 'Verification',
    sub: 'Statutory due diligence, queue review & compliance audit',
    slots: { view: true, edit: true, delete: true, approve: true },
  },
  {
    id: 'Documents',
    name: 'Documents (Document Vault)',
    sub: 'Encrypted statutory filings, GST proofs & factory blueprints',
    slots: { view: true, create: true, edit: true, delete: true, approve: true },
  },
  {
    id: 'Products',
    name: 'Products',
    sub: 'Commercial product catalog, technical specs & datasheets',
    slots: { view: true, create: true, edit: true, delete: true },
  },
  {
    id: 'Product Images',
    name: 'Product Images',
    sub: 'High-resolution plant photos, product galleries & media CDN',
    slots: { view: true, create: true, delete: true },
  },
  {
    id: 'Buyer Enquiries',
    name: 'Buyer Enquiries',
    sub: 'Centralized RFQ leads & buyer proposals (Admin Exclusive)',
    slots: { view: true, edit: true, approve: true, respond: true },
    customActionLabels: {
      respond: 'Respond to RFQ',
      approve: 'Lifecycle Status',
    },
    vendorRestricted: true,
  },
  {
    id: 'Trust Scoring',
    name: 'Trust Scoring',
    sub: '7-dimension weighted rating algorithm & score recalculation',
    slots: { view: true, edit: true, approve: true },
  },
  {
    id: 'Reports & Logs',
    name: 'Reports & Logs',
    sub: 'Immutable audit ledgers, compliance stamps & decision logs',
    slots: { view: true, export: true },
  },
  {
    id: 'Notifications',
    name: 'Notifications',
    sub: 'Platform-wide dispatch, broadcast alerts & automated email/SMS',
    slots: { view: true, create: true },
  },
  {
    id: 'Settings',
    name: 'Settings',
    sub: 'Platform security options, SLAs & master configurations',
    slots: { view: true, edit: true },
  },
  {
    id: 'RBAC / Access Control',
    name: 'RBAC / Access Control',
    sub: 'Role definitions, granular matrix policies & IAM governance',
    slots: { view: true, edit: true },
  },
];

const FALLBACK_DEFAULT_ROLES: Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    code: 'super_admin',
    label: 'Super Administrator',
    description: 'Platform head with full statutory approval authority.',
    isSystem: true,
    isActive: true,
    isSuperAdmin: true,
    userCount: 1,
    permissionsCount: 'Full Access (*)',
    permissionCodes: ['*'],
    permissions: [],
  },
  {
    id: 2,
    name: 'Admin',
    code: 'admin',
    label: 'Platform Administrator',
    description: 'Platform administrator with verification and operational authority.',
    isSystem: true,
    isActive: true,
    isSuperAdmin: false,
    userCount: 0,
    permissionsCount: 25,
    permissionCodes: [
      'dashboard.view',
      'dashboard.export',
      'users.view',
      'users.create',
      'users.edit',
      'users.export',
      'vendors.view',
      'vendors.create',
      'vendors.edit',
      'vendors.approve',
      'vendors.export',
      'verification.view',
      'verification.edit',
      'verification.approve',
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.approve',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'enquiries.view',
      'enquiries.respond',
      'enquiries.status',
    ],
    permissions: [],
  },
  {
    id: 3,
    name: 'Vendor',
    code: 'vendor',
    label: 'Empanelled Vendor / Supplier',
    description: 'Self-service vendor account strictly restricted to owned records.',
    isSystem: true,
    isActive: true,
    isSuperAdmin: false,
    userCount: 2,
    permissionsCount: 4,
    permissionCodes: [
      'vendors.edit',
      'documents.view',
      'documents.create',
      'products.view',
    ],
    permissions: [],
  },
  {
    id: 4,
    name: 'Verification Officer',
    code: 'verification_officer',
    label: 'Statutory Verification Officer',
    description: 'Desk officer verifying GSTIN, MCA21 directors and plant compliance.',
    isSystem: false,
    isActive: true,
    isSuperAdmin: false,
    userCount: 0,
    permissionsCount: 7,
    permissionCodes: [
      'dashboard.view',
      'verification.view',
      'verification.edit',
      'verification.approve',
      'documents.view',
      'documents.approve',
      'vendors.view',
    ],
    permissions: [],
  },
];

const ACTION_MAP: Record<string, string> = {
  Dashboard: 'dashboard',
  Users: 'users',
  Vendors: 'vendors',
  'Business Profile': 'vendors',
  Verification: 'verification',
  Documents: 'documents',
  'Document Vault': 'documents',
  'Trust Scoring': 'scoring',
  'Reports & Logs': 'reports',
  Settings: 'settings',
  Products: 'products',
  'Product Images': 'products',
  'Buyer Enquiries': 'enquiries',
  Notifications: 'notifications',
  'RBAC / Access Control': 'users',
};

const ACTION_VERBS: ActionVerb[] = ['view', 'create', 'edit', 'delete', 'approve', 'respond', 'export'];

export function AccessControlWorkspace() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  const [rawCatalog, setRawCatalog] = useState<Permission[]>([]);
  const [totalPermissionsCount, setTotalPermissionsCount] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active permissions for currently selected role
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set());

  // Search and filter states
  const [roleSearchQuery, setRoleSearchQuery] = useState<string>('');
  const [permSearchQuery, setPermSearchQuery] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState<boolean>(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState<boolean>(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState<boolean>(false);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePreset, setNewRolePreset] = useState<'empty' | 'admin' | 'verification'>('empty');

  // Edit Role Form State
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  // New Permission Form State
  const [newPermModule, setNewPermModule] = useState('Vendors');
  const [newPermAction, setNewPermAction] = useState<ActionVerb>('view');
  const [newPermCode, setNewPermCode] = useState('');
  const [newPermName, setNewPermName] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');

  // Module configuration state
  const [moduleConfigs, setModuleConfigs] = useState<ModuleSlotConfig[]>(DEFAULT_MODULE_CONFIGS);
  const [permissionCodeMap, setPermissionCodeMap] = useState<Record<string, string>>({});
  const [permissionDetailMap, setPermissionDetailMap] = useState<Record<string, Permission>>({});

  // Fetch all RBAC data from backend
  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [fetchedRoles, fetchedCatalog] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
      ]);

      setRoles(fetchedRoles);

      if (fetchedCatalog?.catalog) {
        setRawCatalog(fetchedCatalog.catalog);
        setTotalPermissionsCount(fetchedCatalog.total || fetchedCatalog.catalog.length);

        const dynamicSlots: Record<string, Record<string, boolean>> = {};
        const codeMap: Record<string, string> = {};
        const detailMap: Record<string, Permission> = {};

        fetchedCatalog.catalog.forEach((p) => {
          if (!dynamicSlots[p.module]) dynamicSlots[p.module] = {};

          if (p.code === 'enquiries.respond') {
            dynamicSlots['Buyer Enquiries'] = dynamicSlots['Buyer Enquiries'] || {};
            dynamicSlots['Buyer Enquiries']['respond'] = true;
            codeMap['Buyer Enquiries::respond'] = 'enquiries.respond';
          } else if (p.code === 'enquiries.status') {
            dynamicSlots['Buyer Enquiries'] = dynamicSlots['Buyer Enquiries'] || {};
            dynamicSlots['Buyer Enquiries']['approve'] = true;
            codeMap['Buyer Enquiries::approve'] = 'enquiries.status';
          } else {
            dynamicSlots[p.module][p.action as ActionVerb] = true;
            codeMap[`${p.module}::${p.action}`] = p.code;
          }
          detailMap[p.code] = p;
        });

        setPermissionCodeMap(codeMap);
        setPermissionDetailMap(detailMap);

        setModuleConfigs((prev) => {
          const known = new Set(prev.flatMap((mod) => [mod.id, mod.name]));
          const extraModules: ModuleSlotConfig[] = Object.keys(dynamicSlots)
            .filter((moduleName) => !known.has(moduleName))
            .map((moduleName) => ({
              id: moduleName,
              name: moduleName,
              sub: 'Dynamic system permission module',
              slots: Object.fromEntries(
                Object.keys(dynamicSlots[moduleName]).map((action) => [action, true])
              ),
            }));

          const updated = prev.map((mod) => {
            const extra = dynamicSlots[mod.name] || dynamicSlots[mod.id] || {};
            return {
              ...mod,
              slots: { ...mod.slots, ...extra },
            };
          });

          return [...updated, ...extraModules];
        });
      }

      // Preserve active role if possible, or select default role
      setActiveRoleId((prevActiveId) => {
        let chosenRole = fetchedRoles.find((r) => r.id === prevActiveId);
        if (!chosenRole && fetchedRoles.length > 0) {
          chosenRole =
            fetchedRoles.find((r) => r.code === 'super_admin') ||
            fetchedRoles.find((r) => r.code === 'vendor') ||
            fetchedRoles[0];
        }
        if (chosenRole) {
          const codes = new Set<string>((chosenRole.permissionCodes || []).map(String));
          setSelectedPermissions(codes);
          setInitialPermissions(new Set<string>(codes));
          return chosenRole.id;
        }
        return null;
      });
    } catch (err: unknown) {
      console.warn('Backend RBAC data note:', err);
      // Graceful fallback for demo personas / unauthenticated admin states
      setRoles((prev) => (prev.length > 0 ? prev : FALLBACK_DEFAULT_ROLES));
      setActiveRoleId((prevActiveId) => {
        if (prevActiveId) return prevActiveId;
        const initial = FALLBACK_DEFAULT_ROLES[0];
        const codes = new Set<string>((initial.permissionCodes || []).map(String));
        setSelectedPermissions(codes);
        setInitialPermissions(new Set<string>(codes));
        return initial.id;
      });
      const errStr = String(err);
      if (errStr.includes('403') || errStr.includes('Access Denied')) {
        toast.info('Viewing Access Control Registry in Demo Mode', {
          description: 'Live matrix modifications require signing in with a Super Admin or Platform Admin account.',
        });
      } else {
        toast.error('Could not connect to RBAC service. Showing preconfigured role registry.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Active Role Object
  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === activeRoleId) || roles[0];
  }, [roles, activeRoleId]);

  const isSuperAdmin = currentRole?.code === 'super_admin';
  const isVendorRole = currentRole?.code === 'vendor';

  // Check if there are unsaved pending matrix changes
  const isDirty = useMemo(() => {
    if (isSuperAdmin) return false;
    if (selectedPermissions.size !== initialPermissions.size) return true;
    for (const code of selectedPermissions) {
      if (!initialPermissions.has(code)) return true;
    }
    return false;
  }, [selectedPermissions, initialPermissions, isSuperAdmin]);

  // Handle switching selected role
  const handleSelectRole = (role: Role) => {
    if (role.id === activeRoleId) return;
    if (isDirty) {
      const confirmLeave = window.confirm(
        `You have unsaved permission changes for "${currentRole?.name}". Switch to "${role.name}" without saving?`
      );
      if (!confirmLeave) return;
    }
    setActiveRoleId(role.id);
    const codes = new Set<string>((role.permissionCodes || []).map(String));
    setSelectedPermissions(codes);
    setInitialPermissions(new Set<string>(codes));
  };

  // Helper to resolve canonical permission code
  const getPermissionCode = (moduleName: string, action: string) => {
    const catalogCode = permissionCodeMap[`${moduleName}::${action}`];
    if (catalogCode) return catalogCode;
    const prefix = ACTION_MAP[moduleName] || moduleName.toLowerCase().replace(/\s+/g, '_');
    return `${prefix}.${action}`;
  };

  // Toggle single permission switch
  const handleTogglePermission = (moduleName: string, action: string, isChecked: boolean) => {
    if (isSuperAdmin) return;
    const code = getPermissionCode(moduleName, action);
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (isChecked) {
        next.add(code);
      } else {
        next.delete(code);
      }
      return next;
    });
  };

  // Toggle all permissions for an entire module row
  const handleToggleRow = (mod: ModuleSlotConfig, shouldEnable: boolean) => {
    if (isSuperAdmin) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      ACTION_VERBS.forEach((act) => {
        if (mod.slots[act]) {
          // If Vendor role and Buyer Enquiries, enforce restriction rule
          if (isVendorRole && mod.vendorRestricted) return;
          const code = getPermissionCode(mod.id, act);
          if (shouldEnable) {
            next.add(code);
          } else {
            next.delete(code);
          }
        }
      });
      return next;
    });
  };

  // Select all permissions across currently filtered modules
  const handleSelectAllVisible = () => {
    if (isSuperAdmin) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      filteredModuleConfigs.forEach((mod) => {
        ACTION_VERBS.forEach((act) => {
          if (mod.slots[act]) {
            if (isVendorRole && mod.vendorRestricted) return;
            const code = getPermissionCode(mod.id, act);
            next.add(code);
          }
        });
      });
      return next;
    });
    toast.success('All visible permissions enabled for this role');
  };

  // Clear all permissions across currently filtered modules
  const handleClearAllVisible = () => {
    if (isSuperAdmin) return;
    const confirmed = window.confirm(
      `Clear all visible permissions for role "${currentRole?.name}"?`
    );
    if (!confirmed) return;

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      filteredModuleConfigs.forEach((mod) => {
        ACTION_VERBS.forEach((act) => {
          if (mod.slots[act]) {
            const code = getPermissionCode(mod.id, act);
            next.delete(code);
          }
        });
      });
      return next;
    });
    toast.info('All visible permissions cleared');
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!currentRole || isSuperAdmin) return;
    try {
      setIsSaving(true);
      const codesArray = Array.from(selectedPermissions);
      await updateRolePermissions(currentRole.id, codesArray);

      // Update local roles state
      setRoles((prev) =>
        prev.map((r) =>
          r.id === currentRole.id
            ? { ...r, permissionCodes: codesArray, permissionsCount: codesArray.length }
            : r
        )
      );

      setInitialPermissions(new Set(selectedPermissions));
      toast.success(`Access permissions updated successfully for "${currentRole.name}"`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to save role permissions.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset unsaved changes
  const handleResetChanges = () => {
    setSelectedPermissions(new Set(initialPermissions));
    toast.info('Reverted unsaved matrix changes');
  };

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return roles;
    const q = roleSearchQuery.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [roles, roleSearchQuery]);

  // Filtered Modules
  const filteredModuleConfigs = useMemo(() => {
    return moduleConfigs.filter((mod) => {
      // 1. Filter by Module Dropdown
      if (moduleFilter !== 'all' && mod.id !== moduleFilter && mod.name !== moduleFilter) {
        return false;
      }
      // 2. Filter by Permission Search Query
      if (permSearchQuery.trim()) {
        const q = permSearchQuery.toLowerCase().trim();
        const matchesModule =
          mod.name.toLowerCase().includes(q) ||
          mod.sub.toLowerCase().includes(q) ||
          mod.id.toLowerCase().includes(q);
        if (matchesModule) return true;

        // Check if any slot code or name in this module matches
        const matchesAnySlot = ACTION_VERBS.some((act) => {
          if (!mod.slots[act]) return false;
          const code = getPermissionCode(mod.id, act);
          const detail = permissionDetailMap[code];
          return (
            code.toLowerCase().includes(q) ||
            (detail &&
              (detail.name.toLowerCase().includes(q) ||
                detail.description.toLowerCase().includes(q)))
          );
        });
        return matchesAnySlot;
      }
      return true;
    });
  }, [moduleConfigs, moduleFilter, permSearchQuery, permissionDetailMap]);

  // Dynamic Role Creation
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast.error('Role name and unique identifier code are required.');
      return;
    }

    try {
      let initialCodes: string[] = [];
      if (newRolePreset === 'admin') {
        const adminRole = roles.find((r) => r.code === 'admin');
        initialCodes = adminRole?.permissionCodes || [];
      } else if (newRolePreset === 'verification') {
        const vRole = roles.find((r) => r.code === 'verification_officer');
        initialCodes = vRole?.permissionCodes || [];
      }

      const created = await createCustomRole({
        name: newRoleName.trim(),
        code: newRoleCode.trim().toLowerCase(),
        description: newRoleDesc.trim(),
        permissionCodes: initialCodes,
      });

      toast.success(`Role "${created.name}" created successfully!`);
      setIsRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleCode('');
      setNewRoleDesc('');

      // Refresh list
      const refreshedRoles = await getAllRoles();
      setRoles(refreshedRoles);
      setActiveRoleId(created.id);
      setSelectedPermissions(new Set<string>(initialCodes));
      setInitialPermissions(new Set<string>(initialCodes));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to create new role.'));
    }
  };

  // Edit Role Submit
  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRole || currentRole.isSystem || isSuperAdmin) return;
    if (!editRoleName.trim()) {
      toast.error('Role name is required.');
      return;
    }

    try {
      await updateCustomRole(currentRole.id, {
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
      });

      toast.success(`Role "${editRoleName}" updated successfully!`);
      setIsEditRoleModalOpen(false);

      // Refresh roles
      const refreshedRoles = await getAllRoles();
      setRoles(refreshedRoles);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update role details.'));
    }
  };

  // Delete Role Submit
  const handleDeleteRoleSubmit = async () => {
    if (!currentRole || currentRole.isSystem || isSuperAdmin) {
      toast.error('System roles are protected and cannot be deleted.');
      return;
    }

    try {
      await deleteCustomRole(currentRole.id);
      toast.success(`Role "${currentRole.name}" deleted successfully.`);
      setIsDeleteRoleModalOpen(false);

      // Refresh roles
      const refreshedRoles = await getAllRoles();
      setRoles(refreshedRoles);
      if (refreshedRoles.length > 0) {
        handleSelectRole(refreshedRoles[0]);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to delete role.'));
    }
  };

  // Dynamic Permission Creation
  const handleCreatePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermCode.trim() || !newPermName.trim()) {
      toast.error('Permission code and display label are required.');
      return;
    }

    try {
      const normalizedCode = newPermCode.trim().toLowerCase();
      await createCustomPermission({
        module: newPermModule,
        action: newPermAction,
        code: normalizedCode,
        name: newPermName.trim(),
        description: newPermDesc.trim(),
      });

      setPermissionCodeMap((prev) => ({
        ...prev,
        [`${newPermModule}::${newPermAction}`]: normalizedCode,
      }));

      setModuleConfigs((prev) => {
        const exists = prev.some((mod) => mod.name === newPermModule || mod.id === newPermModule);
        if (exists) {
          return prev.map((mod) => {
            if (mod.name === newPermModule || mod.id === newPermModule) {
              return { ...mod, slots: { ...mod.slots, [newPermAction]: true } };
            }
            return mod;
          });
        }

        return [
          ...prev,
          {
            id: newPermModule,
            name: newPermModule,
            sub: 'Dynamic system permission module',
            slots: { [newPermAction]: true },
          },
        ];
      });

      toast.success(`Dynamic permission [${normalizedCode}] registered successfully!`);
      setIsPermModalOpen(false);
      setNewPermCode('');
      setNewPermName('');
      setNewPermDesc('');

      fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to register permission.'));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-xs">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">Loading Access Control & Permissions...</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to BITAINTEL enterprise IAM gateway</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* ===================================================================== */}
      {/* SECTION A: COMPACT PAGE HEADER                                        */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl px-4 py-3 sm:px-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
              <ShieldCheck className="w-2.5 h-2.5 mr-1 text-primary-600" />
              Enterprise IAM & Access Control
            </span>
            <span className="text-[11px] text-slate-400 font-mono">BITAINTEL v2.4</span>
            {isDirty && !isSuperAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                Unsaved Changes
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight">
            Access Control & Permissions
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight">
            Manage roles, permissions and access policies across the BitaIntel platform.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5 text-primary-600" />
            <span>Add New Role</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPermModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add New Permission</span>
          </button>

          <button
            type="button"
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION B: COMPACT OVERVIEW STATISTICS (4 METRICS)                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Metric 1: Total Roles */}
        <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
              Total Roles
            </span>
            <p className="text-lg font-black text-slate-900 font-mono leading-tight mt-0.5">
              {roles.length}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Configured in registry</p>
          </div>
          <div className="size-8 rounded-lg bg-slate-100 text-slate-700 grid place-items-center shrink-0">
            <Users className="size-4" />
          </div>
        </div>

        {/* Metric 2: Total Permissions */}
        <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
              Total Permissions
            </span>
            <p className="text-lg font-black text-slate-900 font-mono leading-tight mt-0.5">
              {totalPermissionsCount || rawCatalog.length || 33}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Catalogued capabilities</p>
          </div>
          <div className="size-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center shrink-0">
            <Key className="size-4" />
          </div>
        </div>

        {/* Metric 3: Active Role Scope */}
        <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
              Active Role
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate leading-tight mt-0.5">
              {currentRole?.name || 'Super Admin'}
            </p>
            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
              isSuperAdmin
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : currentRole?.isSystem
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-primary-50 text-primary-700 border border-primary-200'
            }`}>
              {isSuperAdmin ? 'Wildcard Protected' : currentRole?.isSystem ? 'System' : 'Custom'}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-slate-900 text-white grid place-items-center shrink-0">
            <ShieldCheck className="size-4 text-primary-400" />
          </div>
        </div>

        {/* Metric 4: Total Permission Assignments */}
        <div className="py-2.5 px-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
              Assignments
            </span>
            <p className="text-lg font-black text-primary-700 font-mono leading-tight mt-0.5">
              {isSuperAdmin ? 'Full Access (*)' : selectedPermissions.size}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Granted to active role</p>
          </div>
          <div className="size-8 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION C & D: ENTERPRISE DUAL-PANE WORKSPACE                         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* =================================================================== */}
        {/* LEFT PANEL: ROLE SELECTOR & DIRECTORY (lg:col-span-3, approx 270px) */}
        {/* =================================================================== */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Configured Roles
              </h2>
              <p className="text-[10px] text-slate-400">Select role to view policy</p>
            </div>
            <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
              {roles.length}
            </span>
          </div>

          {/* Search Roles Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearchQuery}
              onChange={(e) => setRoleSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
            />
            {roleSearchQuery && (
              <button
                type="button"
                onClick={() => setRoleSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Role Cards List with Slider */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredRoles.map((role) => {
              const isSelected = role.id === activeRoleId;
              const isRoleSuper = role.code === 'super_admin';
              const permCount = isRoleSuper
                ? 'Full Access'
                : isSelected
                ? `${selectedPermissions.size} perms`
                : `${role.permissionsCount || (role.permissionCodes || []).length} perms`;

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`cursor-pointer p-2.5 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {role.name}
                      </p>
                      <p className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {role.code}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isRoleSuper ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                          isSelected ? 'bg-amber-400/20 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : !role.isSystem ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-primary-500/20 text-primary-200' : 'bg-blue-50 text-blue-700'
                        }`}>
                          Custom
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {role.description && (
                    <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {role.description}
                    </p>
                  )}

                  <div className={`flex items-center justify-between text-[9px] mt-1.5 pt-1.5 border-t font-mono ${
                    isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span>{permCount}</span>
                    <span>{role.userCount || 0} users</span>
                  </div>
                </div>
              );
            })}

            {filteredRoles.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No roles match &quot;{roleSearchQuery}&quot;
              </div>
            )}
          </div>

          {/* Role Actions: Edit, Delete for custom roles */}
          {currentRole && !currentRole.isSystem && !isSuperAdmin && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditRoleName(currentRole.name);
                    setEditRoleDesc(currentRole.description || '');
                    setIsEditRoleModalOpen(true);
                  }}
                  className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center gap-1 transition"
                >
                  <Edit2 className="size-3 text-slate-500" />
                  <span>Edit Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteRoleModalOpen(true)}
                  className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded flex items-center justify-center gap-1 transition"
                >
                  <Trash2 className="size-3 text-rose-500" />
                  <span>Delete Role</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANEL: MAIN PERMISSION MATRIX WORKSPACE (lg:col-span-9)        */}
        {/* =================================================================== */}
        <div className="lg:col-span-9 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {/* Active Role Policy Header */}
          <div className="py-2.5 px-4 sm:px-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {currentRole?.name}
                </h2>
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    WILDCARD SUPERADMIN
                  </span>
                )}
                {isVendorRole && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                    SELF-SERVICE VENDOR
                  </span>
                )}
                {isDirty && !isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                    <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-2xl">
                {currentRole?.description || 'Grant or revoke granular API and UI privileges for accounts under this role.'}
              </p>
            </div>

            {/* Quick stats on the right of role header */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="text-right">
                <span className="block text-base font-black text-slate-900 font-mono leading-none">
                  {currentRole?.userCount || 0}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Users
                </span>
              </div>
              <div className="text-right border-l border-slate-200 pl-3.5">
                <span className="block text-base font-black text-primary-700 font-mono leading-none">
                  {isSuperAdmin ? 'All' : selectedPermissions.size}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Permissions
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SECTION E: STICKY PERMISSION MANAGEMENT TOOLBAR                   */}
          {/* ================================================================= */}
          <div className="bg-white border-b border-slate-200/80 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs">
            {/* Left Controls: Search and Filter */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Search Permissions */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter permissions, codes..."
                  value={permSearchQuery}
                  onChange={(e) => setPermSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                />
                {permSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPermSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Module Filter Dropdown */}
              <div className="flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3 text-slate-400 hidden sm:block" />
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Modules ({moduleConfigs.length})</option>
                  {moduleConfigs.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Controls: Bulk actions, Reset & Save */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                    title="Enable all visible permission slots"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllVisible}
                    className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Clear all visible permission slots"
                  >
                    Clear All
                  </button>
                </>
              )}

              {isDirty && !isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleResetChanges}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Discard</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={!isDirty || isSaving || isSuperAdmin}
                className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg shadow-2xs transition ${
                  isDirty && !isSuperAdmin
                    ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer ring-2 ring-primary-500/30'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MAIN PERMISSION MATRIX TABLE WITH INTERNAL SLIDER                 */}
          {/* ================================================================= */}
          <div className="max-h-[460px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/90 shadow-2xs">
                <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-2/6">Module / Resource</th>
                  <th className="py-2.5 px-1.5 text-center w-11">View</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Create</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Edit</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Delete</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Approve</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Respond</th>
                  <th className="py-2.5 px-1.5 text-center w-11">Export</th>
                  <th className="py-2.5 px-4 text-right w-24">Row Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredModuleConfigs.map((mod) => {
                  const applicableCodes = ACTION_VERBS
                    .filter((act) => mod.slots[act])
                    .map((act) => getPermissionCode(mod.id, act));

                  const isRowAllOn =
                    applicableCodes.length > 0 &&
                    applicableCodes.every(
                      (code) => isSuperAdmin || selectedPermissions.has(code)
                    );

                  // Special Business Rule Indicator for Vendor & Buyer Enquiries
                  const isVendorEnquiryBlocked = isVendorRole && mod.vendorRestricted;

                  return (
                    <tr
                      key={mod.id}
                      className={`transition-colors ${
                        isVendorEnquiryBlocked
                          ? 'bg-amber-50/30 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Module Title & Subtitle */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {mod.name}
                          </span>
                          {isVendorEnquiryBlocked && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0"
                              title="Buyer enquiries follow the BitaIntel corporate rule: submitted to platform, reviewed & responded by Super Admin only."
                            >
                              <ShieldAlert className="size-2.5 text-amber-700" />
                              Super Admin Only
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                          {mod.sub}
                        </p>
                      </td>

                      {/* 7 Action Slot Checkboxes */}
                      {ACTION_VERBS.map((act) => {
                        const isSlotApplicable = mod.slots[act];
                        if (!isSlotApplicable) {
                          return (
                            <td
                              key={act}
                              className="py-2.5 px-1.5 text-center text-slate-300 font-mono select-none text-xs"
                            >
                              –
                            </td>
                          );
                        }

                        const code = getPermissionCode(mod.id, act);
                        const isChecked = isSuperAdmin || selectedPermissions.has(code);
                        const isBlocked = isSuperAdmin || isVendorEnquiryBlocked;
                        const customLabel = mod.customActionLabels?.[act];
                        const permDetail = permissionDetailMap[code];

                        return (
                          <td key={act} className="py-2.5 px-1.5 text-center">
                            <div className="inline-flex flex-col items-center group relative">
                              <label
                                className={`relative inline-flex items-center ${
                                  isBlocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                }`}
                                title={`${permDetail?.name || code} (${code})`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isBlocked}
                                  onChange={(e) =>
                                    handleTogglePermission(mod.id, act, e.target.checked)
                                  }
                                  className="sr-only peer"
                                />
                                <div
                                  className={`w-8 h-4.5 rounded-full peer peer-focus:outline-none transition-colors duration-200 ease-in-out ${
                                    isChecked
                                      ? 'bg-primary-600'
                                      : 'bg-slate-200'
                                  }`}
                                >
                                  <div
                                    className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out mt-0.5 ml-0.5 ${
                                      isChecked ? 'translate-x-3.5' : 'translate-x-0'
                                    }`}
                                  />
                                </div>
                              </label>

                              {customLabel && (
                                <span className="text-[8px] font-bold text-slate-400 mt-0.5 block tracking-tight">
                                  {customLabel}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Row Action: Select All / Clear All */}
                      <td className="py-2.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center justify-end gap-1">
                            <Lock className="size-2.5 text-slate-400" />
                            <span>Locked</span>
                          </span>
                        ) : isVendorEnquiryBlocked ? (
                          <span className="text-[9px] font-mono font-bold text-amber-700">
                            Restricted
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleRow(mod, !isRowAllOn)}
                            className="text-[10px] font-bold text-primary-700 hover:text-primary-800 transition hover:underline cursor-pointer"
                          >
                            {isRowAllOn ? 'Clear row' : 'Select row'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredModuleConfigs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      No modules or permissions match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* ===================================================================== */}
      {/* MODAL 1: ADD NEW ROLE                                                 */}
      {/* ===================================================================== */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-600" />
                Add New Role
              </h3>
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="size-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compliance Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unique Code Identifier (Slug)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. compliance_auditor"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inspects factory safety and statutory GST filings"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Permissions Preset</label>
                <select
                  value={newRolePreset}
                  onChange={(e) => setNewRolePreset(e.target.value as 'empty' | 'admin' | 'verification')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="empty">Start Blank (0 Permissions)</option>
                  <option value="verification">Clone Verification Team Preset</option>
                  <option value="admin">Clone Platform Admin Preset</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs transition"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT ROLE                                                    */}
      {/* ===================================================================== */}
      {isEditRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary-600" />
                Edit Custom Role
              </h3>
              <button
                type="button"
                onClick={() => setIsEditRoleModalOpen(false)}
                className="size-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditRoleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs transition"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: DELETE ROLE CONFIRMATION                                     */}
      {/* ===================================================================== */}
      {isDeleteRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-full bg-rose-50 grid place-items-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Custom Role</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the role <strong>&quot;{currentRole?.name}&quot;</strong>? All assigned matrix permissions will be unlinked.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteRoleModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRoleSubmit}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: ADD NEW PERMISSION                                           */}
      {/* ===================================================================== */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add New Dynamic Permission
              </h3>
              <button
                type="button"
                onClick={() => setIsPermModalOpen(false)}
                className="size-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 grid place-items-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePermissionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Module Area</label>
                <select
                  value={newPermModule}
                  onChange={(e) => setNewPermModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  {moduleConfigs.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action Verb</label>
                <select
                  value={newPermAction}
                  onChange={(e) => setNewPermAction(e.target.value as ActionVerb)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="view">View</option>
                  <option value="create">Create</option>
                  <option value="edit">Edit</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="respond">Respond</option>
                  <option value="export">Export</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Permission Code Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vendors.bank_account.audit"
                  value={newPermCode}
                  onChange={(e) => setNewPermCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Banking Statement Proofs"
                  value={newPermName}
                  onChange={(e) => setNewPermName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inspect corporate cancelled cheques and IFSC data"
                  value={newPermDesc}
                  onChange={(e) => setNewPermDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs transition"
                >
                  Register Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessControlWorkspace;
