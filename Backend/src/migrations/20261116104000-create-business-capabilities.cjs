'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: business_capabilities table banao ─────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_capabilities', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: 1-to-1 link with business_entities.id
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

      // businessTypeCodes: Array of codes e.g. ["BT01", "BT02", "BT04"]
      businessTypeCodes: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      // selectedCategoryIds: Array of category IDs e.g. ["CAT001", "CAT005"]
      selectedCategoryIds: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      // selectedSubcategoryIds: Array of subcategory IDs e.g. ["SUB001", "SUB015"]
      selectedSubcategoryIds: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      // businessActivities: Array of activities e.g. ["Manufacturing", "Trading", "Export"]
      businessActivities: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      // ─── Manufacturing Capabilities (Conditional) ───
      manufacturingProcesses: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      machineryEquipment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      installedCapacity: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      availableCapacity: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      hasRdLab: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      hasQcLab: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      offersCustomDevelopment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // ─── Quality Systems & Testing (Step 4) ───
      testingCapabilities: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      qualityAssuranceProcedures: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // ─── Service Capabilities (Conditional) ───
      serviceTypes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      serviceExpertise: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      geographicCoverage: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      deliveryCapacity: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // ─── Operating Profile ───
      yearsInBusiness: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      numberOfFacilities: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      annualTurnoverRange: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      totalWorkforce: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      // ─── Facility Proofs & Docs ───
      facilityPhotos: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      technicalAuditDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      regulatoryApprovalDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      regulatoryFilingDetails: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.addIndex('business_capabilities', ['businessId'], {
      name: 'idx_business_capabilities_business_id',
    });
  },

  // ─── DOWN: Rollback ke time table drop karo ──────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('business_capabilities');
  },
};
