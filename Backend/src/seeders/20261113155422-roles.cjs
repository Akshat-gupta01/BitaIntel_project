'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      { code: 'super_admin', name: 'Super Admin', label: 'Super Administrator', description: 'Platform head with full statutory approval authority.', isSystem: true, isActive: true, createdAt: now, updatedAt: now },
      { code: 'admin', name: 'Admin', label: 'Administrator', description: 'Platform administrator with verification and vendor management access.', isSystem: true, isActive: true, createdAt: now, updatedAt: now },
      { code: 'verification_officer', name: 'Verification Officer', label: 'Verification Officer', description: 'Auditor responsible for statutory document review and verification decisions.', isSystem: true, isActive: true, createdAt: now, updatedAt: now },
      { code: 'quality_auditor', name: 'Quality Auditor', label: 'Quality Auditor', description: 'Auditor responsible for quality certification and compliance review.', isSystem: true, isActive: true, createdAt: now, updatedAt: now },
      { code: 'support_team', name: 'Support Team', label: 'Support Team', description: 'Customer support, ticketing inquiries & read-only dossiers.', isSystem: true, isActive: true, createdAt: now, updatedAt: now },
      { code: 'vendor', name: 'Vendor', label: 'Vendor / Manufacturer', description: 'Registered business vendor managing their trust profile.', isSystem: true, isActive: true, createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete('roles', {
      code: ['super_admin', 'admin', 'verification_officer', 'quality_auditor', 'support_team', 'vendor']
    });
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};