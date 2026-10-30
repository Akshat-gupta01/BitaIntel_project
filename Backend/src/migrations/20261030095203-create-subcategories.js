'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subcategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
      status:{
        type:Sequelize.ENUM('active','inactive'),
        allowNull:false,
        defaultValue:'active'
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
    await queryInterface.dropTable('subcategories');
  }
};