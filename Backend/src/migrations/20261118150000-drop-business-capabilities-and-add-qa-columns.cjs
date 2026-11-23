'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add testingCapabilities to business_manufacturing_capabilities if not exists
    const mfgTable = await queryInterface.describeTable('business_manufacturing_capabilities').catch(() => ({}));
    if (!mfgTable.testingCapabilities) {
      await queryInterface.addColumn('business_manufacturing_capabilities', 'testingCapabilities', {
        type: Sequelize.TEXT,
        allowNull: true,
      }).catch(() => {});
    }

    if (!mfgTable.qualityAssuranceProcedures) {
      await queryInterface.addColumn('business_manufacturing_capabilities', 'qualityAssuranceProcedures', {
        type: Sequelize.TEXT,
        allowNull: true,
      }).catch(() => {});
    }

    // 2. Drop obsolete business_capabilities table
    const tableExists = await queryInterface.tableExists('business_capabilities').catch(() => false);
    if (tableExists) {
      await queryInterface.dropTable('business_capabilities').catch(() => {});
    }
  },

  async down(queryInterface, Sequelize) {
    // No-op for obsolete table
  },
};
