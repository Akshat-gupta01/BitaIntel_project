'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditlogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references:{
          model: "users",
          key:"id"
        } 
      }, 
      action: {
        type: Sequelize.STRING,
        allowNull: false // e.g., 'Login', 'Vendor Update', 'Document Approved'
      },
      detail:{
        type:Sequelize.TEXT,
        allowNull: true
      },

      ip_address:{
        type: Sequelize.STRING,
        allowNull: true
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auditlogs');
  }
};