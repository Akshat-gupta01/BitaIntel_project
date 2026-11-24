'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_entities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      ownerUserId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      slug: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      legalName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      tradeName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      companyType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Private Limited Company (Pvt Ltd)'
      },
      registrationNo: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      initials: {
        type: Sequelize.STRING(6),
        allowNull: false,
        defaultValue: 'BE'
      },
      industry: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Manufacturing'
      },
      category: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: false,
        defaultValue: 'India'
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Mumbai'
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Maharashtra'
      },
      registeredAddress: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      postalCode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'India'
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      yearEstablished: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2024
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 40.00
      },
      badge: {
        type: Sequelize.ENUM('Platinum', 'Gold', 'Silver', 'Verified', 'Under Review'),
        allowNull: false,
        defaultValue: 'Under Review'
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      turnover: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: '₹1–5 crore'
      },
      employees: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '10–50'
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      verificationStatus: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'registered'
      },
      isPubliclyVisible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastAudited: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      logoUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      incorporationDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_entities');
  }
};
