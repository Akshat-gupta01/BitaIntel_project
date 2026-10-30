'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_capabilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      business_profile_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'business_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      business_types: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      category_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      subcategory_ids: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      business_activities: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      manufacturing_capabilities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      service_capabilities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      operating_profile: {
        type: Sequelize.JSON,
        allowNull: true
      },
      facility_documents: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      step_status: {
        type: Sequelize.ENUM('draft', 'completed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vendor_capabilities');
  }
};

