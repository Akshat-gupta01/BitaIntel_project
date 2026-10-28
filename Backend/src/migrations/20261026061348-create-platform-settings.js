'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('platform_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      platform_name: {
        type: Sequelize.STRING,
        defaultValue: 'BITAINTEL'
      },
      support_email: {
        type: Sequelize.STRING,
        defaultValue:"support@bitaintel.test"
      },
      badge_threshold: {
        type: Sequelize.INTEGER,
        defaultValue:60
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
    //insert default values
    await queryInterface.bulkInsert("platform_settings", [
      {
        platform_name: "BITAINTEL",
        support_email: "support@bitaintel.test",
        badge_threshold: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('platform_settings');
  }
};