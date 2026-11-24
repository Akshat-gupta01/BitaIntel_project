'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('statutory_identifiers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      businessId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // Har business ka sirf 1 statutory record hoga (1-to-1)
        references: {
          model: 'business_entities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gstin: {
        type: Sequelize.STRING(15),
        allowNull: true,
        unique: true // 15-character GST number unique hona chahiye
      },
      pan: {
        type: Sequelize.STRING(10),
        allowNull: true // 10-character PAN card number
      },
      cin: {
        type: Sequelize.STRING(30),
        allowNull: true,
        unique: true // 21-character MCA CIN / LLPIN
      },
      udyamMsme: {
        type: Sequelize.STRING(40),
        allowNull: true // Udyam Registration number
      },
      iecCode: {
        type: Sequelize.STRING(30),
        allowNull: true // Import Export Code
      },
      tan: {
        type: Sequelize.STRING(20),
        allowNull: true // Tax Deduction Account Number
      },
      duns: {
        type: Sequelize.STRING(20),
        allowNull: true // D-U-N-S Number
      },
      dunsNumber: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      lei: {
        type: Sequelize.STRING(30),
        allowNull: true // Legal Entity Identifier
      },
      mcaStatus: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      gstnStatus: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ACTIVE' // 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
      },
      filingFrequency: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Monthly (GSTR-3B)'
      },
      directorDins: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [] // Verified Directors ke DIN numbers ka array
      },
      statutoryPayload: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {} // Government API se aayi hui raw verified JSON details
      },
      lastSyncedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // High-performance search & lookup indexes
    await queryInterface.addIndex('statutory_identifiers', ['gstin']);
    await queryInterface.addIndex('statutory_identifiers', ['businessId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('statutory_identifiers');
  }
};