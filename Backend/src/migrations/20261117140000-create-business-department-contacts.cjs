'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Create business_department_contacts Table ──────────────────────────
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_department_contacts').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_department_contacts', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        businessId: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: 'business_entities',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        department: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'Sales & Inquiries',
        },
        name: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        designation: {
          type: Sequelize.STRING(150),
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        isPrimary: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
    await queryInterface.dropTable('business_department_contacts').catch(() => {});
  },
};
