'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Create business_compliance_declarations Table ──────────────────────
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_compliance_declarations').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_compliance_declarations', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        businessId: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          unique: true,
          references: {
            model: 'business_entities',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        lawfullyScreened: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        noConflictOfInterest: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        sanctionsFreeDeclaration: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        authorityConsent: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  // ─── DOWN: Drop Table ───────────────────────────────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_compliance_declarations').catch(() => {});
  },
};
