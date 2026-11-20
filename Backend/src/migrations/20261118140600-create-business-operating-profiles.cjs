'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('business_operating_profiles').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('business_operating_profiles', {
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
          type: Sequelize.STRING(50),
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
    await queryInterface.dropTable('business_operating_profiles').catch(() => {});
  },
};
