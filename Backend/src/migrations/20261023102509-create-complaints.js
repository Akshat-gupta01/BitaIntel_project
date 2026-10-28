'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('complaints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:"users",
          key:"id"
        }
      },
      business_id:{
        type:Sequelize.INTEGER,
        references:{
          model:"business_profiles",
          key:"id"
        }
      },
      category:{
        type:Sequelize.ENUM("Documentation","Service Quality","Payment Dispute","Misrepresentation","Other"),
        defaultValue:"Documentation"
      },
      priority:{
        type:Sequelize.ENUM("Low","Medium","High"),
        defaultValue:"Medium"
      },

      description:{
        type:Sequelize.TEXT,
        allowNull:false
      },
      subject: {
        type: Sequelize.STRING
      },
      status:{
        type:Sequelize.ENUM("Open","in_progress","Closed","Resolved"),
        defaultValue:"Open"
      },
      admin_response:{
        type:Sequelize.TEXT,
        allowNull:true
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
    await queryInterface.dropTable('complaints');
  }
};