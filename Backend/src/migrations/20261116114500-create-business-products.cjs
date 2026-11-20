'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: business_products table banao (Step 4 Product Catalog) ─────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_products', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: Link to business_entities.id (Foreign Key with Cascade Delete)
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

      // Product identity
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('Product', 'Service'),
        defaultValue: 'Product',
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.STRING(50),
        allowNull: false, // e.g. "CAT001", "CAT017"
      },
      subcategoryId: {
        type: Sequelize.STRING(50),
        allowNull: true,  // e.g. "SUB001", "SUB187"
      },
      brand: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      specifications: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      grade: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      standards: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      hsnCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      countryOfOrigin: {
        type: Sequelize.STRING(100),
        defaultValue: 'India',
        allowNull: false,
      },

      // Supply & Commercial Info
      moq: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      standardOrderQty: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      monthlyCapacity: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      availableStock: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      leadTimeDays: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      sampleAvailability: {
        type: Sequelize.ENUM('Available Free', 'Available Paid', 'Not Available'),
        defaultValue: 'Available Free',
        allowNull: false,
      },
      indicativePrice: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'INR',
        allowNull: false,
      },
      priceValidity: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      targetMarkets: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // Attached Document & Image URLs
      images: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      catalogueDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      technicalDataSheetDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      coaDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      sdsDoc: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      // Timestamps
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Fast lookup index on businessId & categoryId
    await queryInterface.addIndex('business_products', ['businessId'], {
      name: 'idx_business_products_business_id',
    });
    await queryInterface.addIndex('business_products', ['categoryId'], {
      name: 'idx_business_products_category_id',
    });
  },

  // ─── DOWN: Rollback ke liye table delete karo ──────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_products');
  },
};
