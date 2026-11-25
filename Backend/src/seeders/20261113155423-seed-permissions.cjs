'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const PERMISSIONS_CATALOG = [
      // 1. Dashboard
      { code: 'dashboard.view', module: 'Dashboard', action: 'view', name: 'View Executive Dashboard', description: 'Summary, turnaround metrics & executive platform KPIs' },
      { code: 'dashboard.export', module: 'Dashboard', action: 'export', name: 'Export Dashboard Reports', description: 'Download KPI summary summaries and platform metrics' },

      // 2. Users
      { code: 'users.view', module: 'Users', action: 'view', name: 'View Users Directory', description: 'Internal officer accounts and active invitations' },
      { code: 'users.create', module: 'Users', action: 'create', name: 'Invite / Create User', description: 'Register new staff, officers or auditor accounts' },
      { code: 'users.edit', module: 'Users', action: 'edit', name: 'Modify User Roles', description: 'Update staff designations, email and permissions' },
      { code: 'users.delete', module: 'Users', action: 'delete', name: 'Deactivate User Account', description: 'Suspend or revoke internal officer access' },
      { code: 'users.export', module: 'Users', action: 'export', name: 'Export User Roster', description: 'Download internal staff access audit list' },

      // 3. Vendors
      { code: 'vendors.view', module: 'Vendors', action: 'view', name: 'View Vendors Directory', description: 'Explore registered suppliers, profiles and commercial catalogs' },
      { code: 'vendors.create', module: 'Vendors', action: 'create', name: 'Register Vendor Dossier', description: 'Initial onboarding of manufacturing business profiles' },
      { code: 'vendors.edit', module: 'Vendors', action: 'edit', name: 'Edit Business Profile', description: 'Modify statutory identifiers, manufacturing plants & contact cards' },
      { code: 'vendors.delete', module: 'Vendors', action: 'delete', name: 'Archive Vendor Entity', description: 'Remove or purge business listings from public directories' },
      { code: 'vendors.approve', module: 'Vendors', action: 'approve', name: 'Vendor State Change', description: 'Approve business onboarding or suspend enterprise account' },
      { code: 'vendors.export', module: 'Vendors', action: 'export', name: 'Export Vendors Data', description: 'Download vendor dossiers, CSV reports and compliance files' },

      // 4. Verification
      { code: 'verification.view', module: 'Verification', action: 'view', name: 'View Verification Queue', description: 'Inspect queued business entities awaiting statutory due diligence' },
      { code: 'verification.edit', module: 'Verification', action: 'edit', name: 'Review Statutory Proofs', description: 'Inspect GSTIN, PAN, CIN and audit submitted certificates' },
      { code: 'verification.delete', module: 'Verification', action: 'delete', name: 'Dismiss Verification Record', description: 'Remove fraudulent or duplicate submission queue rows' },
      { code: 'verification.approve', module: 'Verification', action: 'approve', name: 'Issue Verification Clearance', description: 'Approve statutory compliance and award Verified/Gold/Platinum badge' },

      // 5. Document Vault
      { code: 'documents.view', module: 'Document Vault', action: 'view', name: 'Browse Document Vault', description: 'Access statutory filings, GST certificates and factory blueprints' },
      { code: 'documents.create', module: 'Document Vault', action: 'create', name: 'Upload Statutory Filing', description: 'Store statutory certificates, PAN proofs and bank declarations' },
      { code: 'documents.edit', module: 'Document Vault', action: 'edit', name: 'Inspect & Annotate Document', description: 'Verify document checksums and submit auditor feedback notes' },
      { code: 'documents.delete', module: 'Document Vault', action: 'delete', name: 'Invalidate Vault Document', description: 'Revoke expired or rejected compliance attachments' },
      { code: 'documents.approve', module: 'Document Vault', action: 'approve', name: 'Accept Document Compliance', description: 'Mark document status as legally VERIFIED' },

      // 6. Trust Scoring Engine
      { code: 'scoring.view', module: 'Trust Scoring', action: 'view', name: 'Inspect Trust Score Breakdown', description: 'Analyze 7-dimension scoring breakdown and weighted components' },
      { code: 'scoring.edit', module: 'Trust Scoring', action: 'edit', name: 'Tune Weight Coefficients', description: 'Configure dimension risk parameters and algorithm multipliers' },
      { code: 'scoring.approve', module: 'Trust Scoring', action: 'approve', name: 'Recalculate Trust Ratings', description: 'Trigger platform-wide score recalculation and tier updates' },

      // 7. Reports & Logs
      { code: 'reports.view', module: 'Reports & Logs', action: 'view', name: 'Access Compliance Audit Trails', description: 'Review immutable statutory logs, decision stamps and IP records' },
      { code: 'reports.export', module: 'Reports & Logs', action: 'export', name: 'Export Official Audit Dossier', description: 'Download digitally stamped PDF audit records and ledger sheets' },

      // 8. Settings
      { code: 'settings.view', module: 'Settings', action: 'view', name: 'View System & Security Settings', description: 'Inspect platform configurations, API integrations and master keys' },
      { code: 'settings.edit', module: 'Settings', action: 'edit', name: 'Configure System Parameters', description: 'Adjust verification SLAs, webhooks and security settings' },

      // 9. Products & Commercial Offerings
      { code: 'products.view', module: 'Products', action: 'view', name: 'View Products Catalog', description: 'Explore registered supplier products, technical specifications and pricing' },
      { code: 'products.create', module: 'Products', action: 'create', name: 'Create Product Offering', description: 'Register new commercial products, technical datasheets and images' },
      { code: 'products.edit', module: 'Products', action: 'edit', name: 'Edit Product Offering', description: 'Update product specifications, prices, MOQ and compliance certificates' },
      { code: 'products.delete', module: 'Products', action: 'delete', name: 'Delete Product Offering', description: 'Remove or archive product offerings from business catalog' },

      // 10. Buyer Enquiries & Centralized RFQ Leads (Admin exclusive)
      { code: 'enquiries.view', module: 'Buyer Enquiries', action: 'view', name: 'View Centralized Buyer Enquiries', description: 'Access RFQ leads and buyer communications across platform' },
      { code: 'enquiries.respond', module: 'Buyer Enquiries', action: 'edit', name: 'Respond to Buyer Enquiries', description: 'Transmit official corporate proposal or response to buyers' },
      { code: 'enquiries.status', module: 'Buyer Enquiries', action: 'approve', name: 'Update Enquiry Status', description: 'Transition lifecycle status of buyer inquiries' },

      // 11. Compliance & Buyer Complaints
      { code: 'complaints.view', module: 'Complaints', action: 'view', name: 'View Compliance & Buyer Complaints', description: 'View compliance and buyer complaints filed against vendor entities' },
      { code: 'complaints.create', module: 'Complaints', action: 'create', name: 'File Compliance Complaint', description: 'Submit a compliance, quality, or delivery complaint against a supplier' },
      { code: 'complaints.edit', module: 'Complaints', action: 'edit', name: 'Investigate & Resolve Complaints', description: 'Update complaint investigation status, resolution notes, and recalculate trust score' },

      // 12. Audit Logs
      { code: 'audit_logs.view', module: 'Audit Logs', action: 'view', name: 'View System Audit Logs', description: 'Inspect immutable admin & compliance action logs across the platform' },
    ];

    const ROLE_PERMISSIONS_MAP = {
      admin: [
        'dashboard.view', 'dashboard.export',
        'users.view', 'users.create', 'users.edit', 'users.export',
        'vendors.view', 'vendors.create', 'vendors.edit', 'vendors.approve', 'vendors.export',
        'verification.view', 'verification.edit', 'verification.approve',
        'documents.view', 'documents.create', 'documents.edit', 'documents.approve',
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'enquiries.view', 'enquiries.respond', 'enquiries.status',
        'complaints.view', 'complaints.create', 'complaints.edit',
        'audit_logs.view',
        'scoring.view', 'scoring.edit', 'scoring.approve',
        'reports.view', 'reports.export',
        'settings.view', 'settings.edit'
      ],
      verification_officer: [
        'dashboard.view',
        'vendors.view',
        'verification.view', 'verification.edit', 'verification.approve',
        'documents.view', 'documents.edit', 'documents.approve',
        'complaints.view', 'complaints.edit',
        'audit_logs.view',
        'scoring.view', 'scoring.approve',
        'reports.view'
      ],
      quality_auditor: [
        'dashboard.view',
        'vendors.view',
        'verification.view', 'verification.edit',
        'documents.view', 'documents.edit',
        'complaints.view', 'complaints.edit',
        'audit_logs.view',
        'scoring.view'
      ],
      support_team: [
        'dashboard.view',
        'vendors.view',
        'complaints.view', 'complaints.create',
        'audit_logs.view',
        'reports.view'
      ],
      // Vendor role possesses self-service permissions. All routes additionally enforce ownerUserId isolation.
      // Vendor role strictly excludes platform-wide administrative viewing (vendors.view) and buyer inquiries.
      vendor: [
        'vendors.edit',
        'documents.view',
        'documents.create',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'complaints.create'
      ]
    };

    // 1. Fetch existing permission codes to avoid duplicate key errors
    const [existingPermRows] = await queryInterface.sequelize.query(
      'SELECT code FROM permissions;'
    ).catch(() => [[]]);

    const existingPermCodes = new Set((existingPermRows || []).map((r) => r.code));

    // Filter only new permissions to insert
    const permissionsToInsert = PERMISSIONS_CATALOG
      .filter((p) => !existingPermCodes.has(p.code))
      .map((p) => ({
        ...p,
        createdAt: now,
        updatedAt: now
      }));

    if (permissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('permissions', permissionsToInsert);
    }

    // 2. Get all permissions mapping (code -> id)
    const [allPermRows] = await queryInterface.sequelize.query('SELECT id, code FROM permissions;');
    const permMap = new Map();
    (allPermRows || []).forEach((r) => permMap.set(r.code, r.id));

    // 3. Get all roles mapping (code -> id)
    const [allRoleRows] = await queryInterface.sequelize.query('SELECT id, code FROM roles;');
    const roleMap = new Map();
    (allRoleRows || []).forEach((r) => roleMap.set(r.code, r.id));

    // 4. Fetch existing role_permissions pairs to avoid duplicates
    const [existingRolePermRows] = await queryInterface.sequelize.query(
      'SELECT roleId, permissionId FROM role_permissions;'
    ).catch(() => [[]]);

    const existingPairSet = new Set(
      (existingRolePermRows || []).map((rp) => `${rp.roleId}_${rp.permissionId}`)
    );

    // 5. Build role_permissions to insert
    const rolePermissionsToInsert = [];

    for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS_MAP)) {
      const roleId = roleMap.get(roleCode);
      if (!roleId) continue;

      for (const pCode of permCodes) {
        const permId = permMap.get(pCode);
        if (!permId) continue;

        const key = `${roleId}_${permId}`;
        if (!existingPairSet.has(key)) {
          rolePermissionsToInsert.push({
            roleId,
            permissionId: permId,
            createdAt: now,
            updatedAt: now
          });
          existingPairSet.add(key);
        }
      }
    }

    if (rolePermissionsToInsert.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const PERMISSION_CODES = [
      'dashboard.view', 'dashboard.export',
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.export',
      'vendors.view', 'vendors.create', 'vendors.edit', 'vendors.delete', 'vendors.approve', 'vendors.export',
      'verification.view', 'verification.edit', 'verification.delete', 'verification.approve',
      'documents.view', 'documents.create', 'documents.edit', 'documents.delete', 'documents.approve',
      'scoring.view', 'scoring.edit', 'scoring.approve',
      'reports.view', 'reports.export',
      'settings.view', 'settings.edit',
      'products.view', 'products.create', 'products.edit', 'products.delete',
      'enquiries.view', 'enquiries.respond', 'enquiries.status',
      'complaints.view', 'complaints.create', 'complaints.edit',
      'audit_logs.view'
    ];

    // Delete mappings for these permissions
    await queryInterface.sequelize.query(`
      DELETE FROM role_permissions 
      WHERE permissionId IN (
        SELECT id FROM permissions WHERE code IN (${PERMISSION_CODES.map((c) => `'${c}'`).join(',')})
      );
    `).catch(() => {});

    // Delete permissions
    await queryInterface.bulkDelete('permissions', {
      code: PERMISSION_CODES
    }).catch(() => {});

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
