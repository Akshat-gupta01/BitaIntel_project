'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const rolePermissions = [
      // ==========================================
      // 1. Super Admin Role (All Permissions)
      // ==========================================
      { role_id: 1, permission_id: 1 },  // view_overview
      { role_id: 1, permission_id: 2 },  // view_user
      { role_id: 1, permission_id: 3 },  // create_user
      { role_id: 1, permission_id: 4 },  // update_user
      { role_id: 1, permission_id: 5 },  // delete_user
      { role_id: 1, permission_id: 6 },  // view_business
      { role_id: 1, permission_id: 7 },  // update_business
      { role_id: 1, permission_id: 8 },  // view_verification_queue
      { role_id: 1, permission_id: 9 },  // run_gst_check
      { role_id: 1, permission_id: 10 }, // view_documents
      { role_id: 1, permission_id: 11 }, // review_document
      { role_id: 1, permission_id: 12 }, // approve_reject_document
      { role_id: 1, permission_id: 13 }, // view_scoring
      { role_id: 1, permission_id: 14 }, // update_scoring
      { role_id: 1, permission_id: 15 }, // view_inquiries
      { role_id: 1, permission_id: 16 }, // manage_inquiries
      { role_id: 1, permission_id: 17 }, // view_complaints
      { role_id: 1, permission_id: 18 }, // manage_complaints
      { role_id: 1, permission_id: 19 }, // resolve_complaint
      { role_id: 1, permission_id: 20 }, // view_reports
      { role_id: 1, permission_id: 21 }, // export_reports
      { role_id: 1, permission_id: 22 }, // view_audit_logs
      { role_id: 1, permission_id: 23 }, // view_platform_settings
      { role_id: 1, permission_id: 24 }, // update_platform_settings
      { role_id: 1, permission_id: 25 }, // view_verification
      { role_id: 1, permission_id: 26 }, // update_verification
     
   

      // ==========================================
      // 2. Admin Role (All Admin Permissions)
      // ==========================================
      { role_id: 2, permission_id: 1 },  // view_overview
      { role_id: 2, permission_id: 2 },  // view_user
      { role_id: 2, permission_id: 3 },  // create_user
      { role_id: 2, permission_id: 4 },  // update_user
      { role_id: 2, permission_id: 5 },  // delete_user
      { role_id: 2, permission_id: 6 },  // view_business
      { role_id: 2, permission_id: 7 },  // update_business
      { role_id: 2, permission_id: 8 },  // view_verification_queue
      { role_id: 2, permission_id: 9 },  // run_gst_check
      { role_id: 2, permission_id: 10 }, // view_documents
      { role_id: 2, permission_id: 11 }, // review_document
      { role_id: 2, permission_id: 12 }, // approve_reject_document
      { role_id: 2, permission_id: 13 }, // view_scoring
      { role_id: 2, permission_id: 14 }, // update_scoring
      { role_id: 2, permission_id: 15 }, // view_inquiries
      { role_id: 2, permission_id: 16 }, // manage_inquiries
      { role_id: 2, permission_id: 17 }, // view_complaints
      { role_id: 2, permission_id: 18 }, // manage_complaints
      { role_id: 2, permission_id: 19 }, // resolve_complaint
      { role_id: 2, permission_id: 20 }, // view_reports
      { role_id: 2, permission_id: 21 }, // export_reports
      { role_id: 2, permission_id: 22 }, // view_audit_logs
      { role_id: 2, permission_id: 23 }, // view_platform_settings
      { role_id: 2, permission_id: 24 }, // update_platform_settings
      { role_id: 2, permission_id: 25 }, // view_verification
      { role_id: 2, permission_id: 26 }, // update_verification
     

      // ==========================================
      // 3. Verification Team Role
      // ==========================================
      { role_id: 3, permission_id: 1 },  // view_overview
      { role_id: 3, permission_id: 6 },  // view_business
      { role_id: 3, permission_id: 7 },  // update_business
      { role_id: 3, permission_id: 8 },  // view_verification_queue
      { role_id: 3, permission_id: 9 },  // run_gst_check
      { role_id: 3, permission_id: 10 }, // view_documents
      { role_id: 3, permission_id: 11 }, // review_document
      { role_id: 3, permission_id: 12 }, // approve_reject_document
      { role_id: 3, permission_id: 25 }, // view_verification
      { role_id: 3, permission_id: 26 }, // update_verification
     

      // ==========================================
      // 4. Support Team Role
      // ==========================================
      { role_id: 4, permission_id: 1 },  // view_overview
      { role_id: 4, permission_id: 6 },  // view_business
      { role_id: 4, permission_id: 15 }, // view_inquiries
      { role_id: 4, permission_id: 16 }, // manage_inquiries
      { role_id: 4, permission_id: 17 }, // view_complaints
      { role_id: 4, permission_id: 18 }, // manage_complaints
      { role_id: 4, permission_id: 19 }, // resolve_complaint

      // ==========================================
      // 5. vendor Role
      // ==========================================
      { role_id: 5, permission_id: 1 },  // view_overview
      { role_id: 5, permission_id: 6 },  // view_business
      { role_id: 5, permission_id: 7 },  // update_business
      { role_id: 5, permission_id: 10 }, // view_documents
      { role_id: 5, permission_id: 13 }, // view_scoring
      { role_id: 5, permission_id: 15 }, // view_inquiries
      { role_id: 5, permission_id: 16 }, // manage_inquiries
      { role_id: 5, permission_id: 17 }, // view_complaints
      { role_id: 5, permission_id: 18 }, // manage_complaints
    ];

    await queryInterface.bulkInsert('rolepermissions', rolePermissions, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rolepermissions', null, {});
  }
};
