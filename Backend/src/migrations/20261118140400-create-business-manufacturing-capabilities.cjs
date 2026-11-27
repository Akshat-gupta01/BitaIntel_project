'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_manufacturing_capabilities').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_manufacturing_capabilities', {
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
        manufacturingProcesses: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        machineryEquipment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        installedCapacity: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        availableCapacity: {
          type: Sequelize.STRING(100),
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
        testingCapabilities: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        qualityAssuranceProcedures: {
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

  async down(queryInterface) {
    await queryInterface.dropTable('business_manufacturing_capabilities').catch(() => {});
  },
};
