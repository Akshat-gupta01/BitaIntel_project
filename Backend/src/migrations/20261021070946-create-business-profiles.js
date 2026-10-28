'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:"users",
          key:"id"
        }
        
      },
      business_name: {
        type: Sequelize.STRING
      },
      legal_name:{
        type: Sequelize.STRING,
        allowNull:true
      },
      industry: {
        type: Sequelize.STRING
      },
      business_email:{
        type: Sequelize.STRING
      },
      business_phone:{
        type: Sequelize.STRING
      },
      business_address:{
        type: Sequelize.TEXT
      },
      city:{
        type: Sequelize.STRING
      },
      state:{
        type: Sequelize.STRING
      },
      gst_number:{
        type: Sequelize.STRING
      },
      website:{
        type: Sequelize.STRING,
        allowNull:true
      },
      description:{
        type: Sequelize.TEXT
      },
      documents_url:{
        type: Sequelize.JSON
      },
      verification_status:{
        type: Sequelize.ENUM("pending", "under_review", "clarification_required","approved", "rejected", "suspended"),
        defaultValue:"pending"
      },
      rejection_reason:{
        type: Sequelize.TEXT
      },
      score: {
        type: Sequelize.INTEGER, 
        defaultValue: 0,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER, 
        defaultValue: 0,
        allowNull: false
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
    await queryInterface.dropTable('business_profiles');
  }
};