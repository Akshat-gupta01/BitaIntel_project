'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inquiries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      business_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "business_profiles",
          key: "id",
        }
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      email:{
        type: Sequelize.STRING,
        allowNull:false
      },
      phone:{
        type: Sequelize.STRING,
        allowNull:false
      },
      subject:{
        type: Sequelize.STRING,
        allowNull:false
      },
      message:{
        type: Sequelize.TEXT,
        allowNull:false
      },
     status: {
        type: Sequelize.ENUM(
          "new",
          "in_progress",
          "responded",
          "closed"
        ),
        allowNull: false,
        defaultValue: "new",
      },
      admin_response:{
        type: Sequelize.TEXT,
        allowNull:true
      },
      is_spam: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spam_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable('inquiries');
  }
};