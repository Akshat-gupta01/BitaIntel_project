'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone:{
        type:Sequelize.STRING,
        allowNull:false,
      },
      
      email:{
        type:Sequelize.STRING,
        allowNull:true,
      },
        phone_otp: {
      type: Sequelize.STRING,
      allowNull: true
    },
    email_otp: {
      type: Sequelize.STRING,
      allowNull: true
    },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull:false,
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
    await queryInterface.dropTable('otps');
  }
};