'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Create business_trade_logistics Table ──────────────────────────────
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_trade_logistics').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_trade_logistics', {
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
        importerExporterStatus: {
          type: Sequelize.ENUM(
            'Domestic Only',
            'Exporter Only',
            'Importer Only',
            'Both Importer & Exporter'
          ),
          allowNull: false,
          defaultValue: 'Domestic Only',
        },
        iecNumber: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        sourcingCountries: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        exportMarkets: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        annualTradeTurnover: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        preferredIncoterms: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: ['FOB'],
        },
        freightArrangements: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        customsClearanceAssistance: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        exportPackagingStandards: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        coldChainCapability: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        tradeReferences: {
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
    await queryInterface.dropTable('business_trade_logistics').catch(() => {});
  },
};
