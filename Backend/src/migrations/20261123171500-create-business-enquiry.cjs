'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_enquiries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      enquiryNumber: {
        type: Sequelize.STRING(30),
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
      productId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'business_products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      productName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      buyerName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      buyerEmail: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      buyerPhone: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      buyerCompany: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Procurement / RFQ Enquiry',
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      budget: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('New', 'Viewed', 'Responded', 'In Discussion', 'Closed/Rejected'),
        allowNull: false,
        defaultValue: 'New',
      },
      replyMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      repliedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('business_enquiries', ['businessId']);
    await queryInterface.addIndex('business_enquiries', ['enquiryNumber']);
    await queryInterface.addIndex('business_enquiries', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('business_enquiries');
  },
};
