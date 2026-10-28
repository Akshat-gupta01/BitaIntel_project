'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('permissions', [
      // 1. Dashboard Overview
      { id: 1, name: 'view_overview' },

      // 2. Users & Roles Management
      { id: 2, name: 'view_user' },
      { id: 3, name: 'create_user' },
      { id: 4, name: 'update_user' },
      { id: 5, name: 'delete_user' },
      
      // 3. Business Management
      { id: 6, name: 'view_business' },
      { id: 7, name: 'update_business' },

      // 4. Verification & GST Checks
      { id: 8, name: 'view_verification_queue' },
      { id: 9, name: 'run_gst_check' },

      // 5. Document Review
      { id: 10, name: 'view_documents' },
      { id: 11, name: 'review_document' },
      { id: 12, name: 'approve_reject_document' },

      // 6. Scoring Configurations
      { id: 13, name: 'view_scoring' },
      { id: 14, name: 'update_scoring' },

      // 7. Inquiries Management
      { id: 15, name: 'view_inquiries' },
      { id: 16, name: 'manage_inquiries' },

      // 8. Complaints & Disputes
      { id: 17, name: 'view_complaints' },
      { id: 18, name: 'manage_complaints' },
      { id: 19, name: 'resolve_complaint' },

      // 9. Reports & Exports
      { id: 20, name: 'view_reports' },
      { id: 21, name: 'export_reports' },

      // 10. Audit Logs
      { id: 22, name: 'view_audit_logs' },

      // 11. Platform Settings
      { id: 23, name: 'view_platform_settings' },
      { id: 24, name: 'update_platform_settings' },

      // 12. Verification Module
      { id: 25, name: 'view_verification' },
      { id: 26, name: 'update_verification' }

    ]); 
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
