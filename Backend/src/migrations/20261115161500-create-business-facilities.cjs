'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: business_facilities table banao ──────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_facilities', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: Kis company ka plant/office hai (Foreign Key -> business_entities.id)
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

      // facilityType: Manufacturing Plant / Branch Office / Warehouse / Corporate Office
      facilityType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Manufacturing Plant',
      },

      // facilityName: Display Name — e.g. "Unit 2: Precision CNC & Surface Treatment Facility"
      facilityName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      // addressLine: Street address / Plot / Industrial zone
      addressLine: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      // city: e.g. "Pune", "Dharwad", "Sanand"
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      // state: e.g. "Maharashtra", "Karnataka", "Gujarat"
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      // pincode: Postal PIN code
      pincode: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      // country: Default India
      country: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'India',
      },

      // isOwned: Owned (true) ya Leased (false)
      isOwned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // plantHead: Factory In-charge / Manager Name (optional)
      plantHead: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      // contactPhone: Plant contact phone number (optional)
      contactPhone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      // createdAt: Record kab bana
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // updatedAt: Record kab last update hua
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  // ─── DOWN: Table hatao (rollback ke liye) ─────────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_facilities');
  },
};
