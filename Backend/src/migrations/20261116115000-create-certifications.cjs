'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: certifications table banao (Step 4 Quality & Compliance Certs) ───
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certifications', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: Link to business_entities.id
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

      // Category of certificate
      category: {
        type: Sequelize.ENUM('QUALITY_CERT', 'REGULATORY_APPROVAL'),
        defaultValue: 'QUALITY_CERT',
        allowNull: false,
      },

      // Certificate Type e.g. "ISO 9001:2015", "WHO-GMP", "CE", "BIS"
      certificateType: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      // Unique certificate registration/audit number
      certificateNumber: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      // Accredited body e.g. "TÜV Rheinland India", "Bureau Veritas", "DNV GL"
      issuingAuthority: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      // Dates
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      expiryDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      // Scope of certification
      scope: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // Applicable Plant / Facility
      applicableFacility: {
        type: Sequelize.STRING(200),
        defaultValue: 'All Facilities',
        allowNull: false,
      },

      // Uploaded certificate evidence PDF path
      evidenceDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      // Status
      status: {
        type: Sequelize.ENUM('Active', 'Expiring Soon', 'Expired'),
        defaultValue: 'Active',
        allowNull: false,
      },

      // Timestamps
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Fast lookup index on businessId
    await queryInterface.addIndex('certifications', ['businessId'], {
      name: 'idx_certifications_business_id',
    });
  },

  // ─── DOWN: Rollback ke liye table delete karo ──────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('certifications');
  },
};
