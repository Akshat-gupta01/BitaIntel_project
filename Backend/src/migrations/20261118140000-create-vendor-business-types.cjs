'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.tableExists('vendor_business_types').catch(() => false);
    if (!tableExists) {
      await queryInterface.createTable('vendor_business_types', {
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
        businessTypeCode: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        businessTypeName: {
          type: Sequelize.STRING(150),
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

      await queryInterface.addIndex('vendor_business_types', ['businessId', 'businessTypeCode'], {
        unique: true,
        name: 'idx_vendor_btypes_unique',
      }).catch(() => {});
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vendor_business_types').catch(() => {});
  },
};
