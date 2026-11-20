'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import type { Role } from '@/types/rbac.types';
import {
  getAllRoles,
  getAllPermissions,
  updateRolePermissions,
  createCustomRole,
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

interface ModuleSlotConfig {
  id: string;
  name: string;
  sub: string;
  slots: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    approve?: boolean;
    export?: boolean;
  };
}

const DEFAULT_MODULE_CONFIGS: ModuleSlotConfig[] = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    sub: 'Summary and executive activity',
    slots: { view: true, export: true },
  },
  {
    id: 'Users',
    name: 'Users',
    sub: 'Accounts and invitations',
    slots: { view: true, create: true, edit: true, delete: true, export: true },
  },
  {
    id: 'Vendors',
    name: 'Vendors',
    sub: 'Registrations and profiles',
    slots: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  },
  {
    id: 'Verification',
    name: 'Verification',
    sub: 'Document and identity checks',
    slots: { view: true, edit: true, delete: true, approve: true },
  },
  {
    id: 'Document Vault',
    name: 'Document Vault',
    sub: 'Statutory compliance filings',
    slots: { view: true, create: true, edit: true, delete: true, approve: true },
  },
  {
    id: 'Trust Scoring',
    name: 'Trust Scoring Matrix',
    sub: '7-dimension weighted rating & risk model',
    slots: { view: true, edit: true, approve: true },
  },
  {
    id: 'Reports & Logs',
    name: 'Reports & Logs',
    sub: 'Generated audit ledgers',
    slots: { view: true, export: true },
  },
  {
    id: 'Settings',
    name: 'Settings',
    sub: 'Roles and system options',
    slots: { view: true, edit: true },
  },
];

const ACTION_MAP: Record<string, string> = {
  Dashboard: 'dashboard',
  Users: 'users',
  Vendors: 'vendors',
  Verification: 'verification',
  'Document Vault': 'documents',
  'Trust Scoring': 'scoring',
  'Reports & Logs': 'reports',
  Settings: 'settings',
};

export function AccessControl() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active permissions for the currently selected role: Set of code strings
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set());

  // Modal dialog states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePreset, setNewRolePreset] = useState<'empty' | 'admin' | 'verification'>('empty');

  // New Permission Form State
  const [newPermModule, setNewPermModule] = useState('Verification');
  const [newPermAction, setNewPermAction] = useState<'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'>('view');
  const [newPermCode, setNewPermCode] = useState('');
  const [newPermName, setNewPermName] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');

  // Module configuration state (allows dynamic additions)
  const [moduleConfigs, setModuleConfigs] = useState<ModuleSlotConfig[]>(DEFAULT_MODULE_CONFIGS);

  // Load roles & permissions on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [fetchedRoles, fetchedCatalog] = await Promise.all([
          getAllRoles(),
          getAllPermissions(),
        ]);

        if (!isMounted) return;

        setRoles(fetchedRoles);

        // Select Admin or first non-superadmin role by default
        if (fetchedRoles.length > 0) {
          const defaultRole = fetchedRoles.find((r) => r.code === 'admin') || fetchedRoles[0];
          setActiveRoleId(defaultRole.id);
          const codes = new Set<string>((defaultRole.permissionCodes || []).map(String));
          setSelectedPermissions(codes);
          setInitialPermissions(new Set<string>(codes));
        }

        // Check if new modules or permissions exist in catalog
        if (fetchedCatalog?.catalog) {
          const dynamicSlots: Record<string, Record<string, boolean>> = {};
          fetchedCatalog.catalog.forEach((p) => {
            if (!dynamicSlots[p.module]) dynamicSlots[p.module] = {};
            dynamicSlots[p.module][p.action] = true;
          });

          setModuleConfigs((prev) =>
            prev.map((mod) => {
              const extra = dynamicSlots[mod.name] || dynamicSlots[mod.id] || {};
              return {
                ...mod,
                slots: { ...mod.slots, ...extra },
              };
            })
          );
        }
      } catch (err: unknown) {
        console.error('Failed to load RBAC data:', err);
        toast.error('Could not connect to RBAC service. Please verify backend.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Active Role Object
  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === activeRoleId) || roles[0];
  }, [roles, activeRoleId]);

  const isSuperAdmin = currentRole?.code === 'super_admin';

  // Check if there are unsaved pending changes
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
    if (isDirty) {
      const confirmLeave = window.confirm(
        'You have unsaved matrix permission changes. Switch role without saving?'
      );
      if (!confirmLeave) return;
    }
    setActiveRoleId(role.id);
    const codes = new Set<string>((role.permissionCodes || []).map(String));
    setSelectedPermissions(codes);
    setInitialPermissions(new Set<string>(codes));
  };

  // Helper to map UI module & action to permission code
  const getPermissionCode = (moduleName: string, action: string) => {
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

  // Toggle all permissions for an entire row
  const handleToggleRow = (mod: ModuleSlotConfig, shouldEnable: boolean) => {
    if (isSuperAdmin) return;
    const actions: (keyof typeof mod.slots)[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      actions.forEach((act) => {
        if (mod.slots[act]) {
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

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!currentRole || isSuperAdmin) return;
    try {
      setIsSaving(true);
      const codesArray = Array.from(selectedPermissions);
      await updateRolePermissions(currentRole.id, codesArray);

      // Update local role list state
      setRoles((prev) =>
        prev.map((r) =>
          r.id === currentRole.id
            ? { ...r, permissionCodes: codesArray, permissionsCount: codesArray.length }
            : r
        )
      );

      setInitialPermissions(new Set(selectedPermissions));
      toast.success(`Access permissions updated successfully for ${currentRole.name}`);
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

  // Handle Dynamic Role Creation
  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast.error('Role name and unique code are required.');
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

      toast.success(`Dynamic role "${created.name}" created successfully!`);
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

  // Handle Dynamic Permission Creation
  const handleCreatePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermCode.trim() || !newPermName.trim()) {
      toast.error('Permission code and display name are required.');
      return;
    }

    try {
      await createCustomPermission({
        module: newPermModule,
        action: newPermAction,
        code: newPermCode.trim().toLowerCase(),
        name: newPermName.trim(),
        description: newPermDesc.trim(),
      });

      // Expand slot in UI if not already visible
      setModuleConfigs((prev) =>
        prev.map((mod) => {
          if (mod.name === newPermModule || mod.id === newPermModule) {
            return {
              ...mod,
              slots: { ...mod.slots, [newPermAction]: true },
            };
          }
          return mod;
        })
      );

      toast.success(`Dynamic permission [${newPermCode}] added to ${newPermModule}!`);
      setIsPermModalOpen(false);
      setNewPermCode('');
      setNewPermName('');
      setNewPermDesc('');

      // Refresh catalog
      const refreshedRoles = await getAllRoles();
      setRoles(refreshedRoles);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to register permission.'));
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">Synchronizing RBAC Matrix...</h3>
        <p className="text-xs text-slate-500 mt-1">Connecting to BITAINTEL dynamic authorization service</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <ShieldCheck className="w-3 h-3 mr-1 text-teal-700" />
              DYNAMIC ROLE-BASED ACCESS CONTROL
            </span>
            <span className="text-xs text-slate-400 font-mono">BITAINTEL v2.4</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Access Control & Role Permissions Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure operational capabilities, manage baseline and custom roles, and grant granular privileges across all 8 enterprise modules.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5 text-teal-700" />
            Add New Role
          </button>

          <button
            onClick={() => setIsPermModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Add New Permission
          </button>

          {isDirty && (
            <button
              onClick={handleResetChanges}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={handleSaveChanges}
            disabled={!isDirty || isSaving || isSuperAdmin}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow transition ${
              isDirty && !isSuperAdmin
                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer ring-2 ring-teal-600/30'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ROLES SELECTOR PANEL */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>ROLES</span>
            <span className="text-[10px] font-mono lowercase text-slate-400 font-normal">
              {roles.length} total
            </span>
          </div>

          <div className="space-y-1">
            {roles.map((role) => {
              const isSelected = role.id === activeRoleId;
              const isRoleSuper = role.code === 'super_admin';
              const permCount = isRoleSuper
                ? 'Full Access'
                : isSelected
                ? `${selectedPermissions.size} permissions`
                : `${role.permissionsCount || (role.permissionCodes || []).length} permissions`;

              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600/40 text-teal-950 font-medium shadow-sm'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-teal-900 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {role.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {role.userCount || 0} users
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>
                      {isRoleSuper ? (
                        <span className="text-amber-600 font-semibold inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : (
                        permCount
                      )}
                    </span>
                    {!role.isSystem && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="w-full mt-2 py-2 px-3 border border-dashed border-slate-300 hover:border-teal-500 text-slate-600 hover:text-teal-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition bg-slate-50/50"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Role
          </button>
        </div>

        {/* RIGHT COLUMN: PERMISSIONS MATRIX TABLE */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          {/* Active Role Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{currentRole?.name}</h3>
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    WILDCARD SUPERADMIN
                  </span>
                )}
                {isDirty && !isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Unsaved edits
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentRole?.description || 'Manage what people in this role can do.'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="block text-lg font-bold text-slate-900 font-mono leading-none">
                  {currentRole?.userCount || 0}
                </span>
                <span className="text-[11px] text-slate-500">users</span>
              </div>
              <div className="text-right border-l border-slate-200 pl-6">
                <span className="block text-lg font-bold text-teal-700 font-mono leading-none">
                  {isSuperAdmin ? 'All' : selectedPermissions.size}
                </span>
                <span className="text-[11px] text-slate-500">permissions on</span>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-3 w-1/3">Area</th>
                  <th className="py-3 px-2 text-center">View</th>
                  <th className="py-3 px-2 text-center">Create</th>
                  <th className="py-3 px-2 text-center">Edit</th>
                  <th className="py-3 px-2 text-center">Delete</th>
                  <th className="py-3 px-2 text-center">Approve</th>
                  <th className="py-3 px-2 text-center">Export</th>
                  <th className="py-3 px-3 text-right">Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {moduleConfigs.map((mod) => {
                  const actions: (keyof typeof mod.slots)[] = [
                    'view',
                    'create',
                    'edit',
                    'delete',
                    'approve',
                    'export',
                  ];

                  // Determine if all applicable slots in this row are on
                  const applicableCodes = actions
                    .filter((act) => mod.slots[act])
                    .map((act) => getPermissionCode(mod.id, act));

                  const isRowAllOn =
                    applicableCodes.length > 0 &&
                    applicableCodes.every(
                      (code) => isSuperAdmin || selectedPermissions.has(code)
                    );

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/50 transition">
                      {/* Module Title & Subtitle */}
                      <td className="py-4 px-3">
                        <div className="font-semibold text-slate-900 text-xs">{mod.name}</div>
                        <div className="text-[11px] text-slate-400">{mod.sub}</div>
                      </td>

                      {/* 6 Action Slot Checkboxes */}
                      {actions.map((act) => {
                        const isSlotApplicable = mod.slots[act];
                        if (!isSlotApplicable) {
                          return (
                            <td
                              key={act}
                              className="py-4 px-2 text-center text-slate-300 font-light select-none"
                            >
                              –
                            </td>
                          );
                        }

                        const code = getPermissionCode(mod.id, act);
                        const isChecked = isSuperAdmin || selectedPermissions.has(code);

                        return (
                          <td key={act} className="py-4 px-2 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isSuperAdmin}
                                onChange={(e) =>
                                  handleTogglePermission(mod.id, act, e.target.checked)
                                }
                                className="sr-only peer"
                              />
                              <div
                                className={`w-8 h-4.5 rounded-full peer peer-focus:outline-none transition-colors duration-200 ease-in-out ${
                                  isChecked
                                    ? 'bg-teal-700'
                                    : 'bg-slate-200'
                                } ${
                                  isSuperAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                                }`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out mt-0.5 ml-0.5 ${
                                    isChecked ? 'translate-x-3.5' : 'translate-x-0'
                                  }`}
                                />
                              </div>
                            </label>
                          </td>
                        );
                      })}

                      {/* Row Action: Select All / Clear All */}
                      <td className="py-4 px-3 text-right">
                        {isSuperAdmin ? (
                          <span className="text-[11px] text-slate-400 font-mono">locked</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleRow(mod, !isRowAllOn)}
                            className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 transition hover:underline"
                          >
                            {isRowAllOn ? 'Clear all' : 'Select all'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD NEW ROLE */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                Add New Dynamic Role
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compliance Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unique Code Identifier (Slug)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. compliance_auditor"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inspects factory safety and statutory GST filings"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Permissions Preset</label>
                <select
                  value={newRolePreset}
                  onChange={(e) => setNewRolePreset(e.target.value as 'empty' | 'admin' | 'verification')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow transition"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW PERMISSION */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add New Dynamic Permission
              </h3>
              <button
                onClick={() => setIsPermModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePermissionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Module Area</label>
                <select
                  value={newPermModule}
                  onChange={(e) => setNewPermModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {moduleConfigs.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Verb</label>
                <select
                  value={newPermAction}
                  onChange={(e) =>
                    setNewPermAction(
                      e.target.value as 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="view">View</option>
                  <option value="create">Create</option>
                  <option value="edit">Edit</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="export">Export</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permission Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vendors.bank_account.audit"
                  value={newPermCode}
                  onChange={(e) => setNewPermCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Banking Statement Proofs"
                  value={newPermName}
                  onChange={(e) => setNewPermName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Inspect corporate cancelled cheques and IFSC data"
                  value={newPermDesc}
                  onChange={(e) => setNewPermDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow transition"
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

export default AccessControl;
