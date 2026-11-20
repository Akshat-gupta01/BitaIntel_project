'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Create business_commercial_terms Table ─────────────────────────────
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_commercial_terms').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_commercial_terms', {
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
        acceptedCurrencies: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: ['INR'],
        },
        paymentMethods: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: ['Bank Transfer (NEFT/RTGS)'],
        },
        advancePaymentPercentage: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: '20%',
        },
        creditTermsDays: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: '30 Days Net',
        },
        moqPolicy: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        samplePolicy: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        warrantyTerms: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        returnPolicy: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    await queryInterface.dropTable('business_commercial_terms').catch(() => {});
  },
};
