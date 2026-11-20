'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Create business_banking_details Table ──────────────────────────────
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_banking_details').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_banking_details', {
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
        accountHolderName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        bankName: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        accountType: {
          type: Sequelize.ENUM(
            'Current Account',
            'Cash Credit / Overdraft',
            'Foreign Currency Account'
          ),
          allowNull: false,
          defaultValue: 'Current Account',
        },
        accountNumber: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        ifscCode: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        swiftBicCode: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
        bankBranch: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        bankCountry: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'India',
        },
        bankProofDoc: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        isBankVerified: {
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
    await queryInterface.dropTable('business_banking_details').catch(() => {});
  },
};
