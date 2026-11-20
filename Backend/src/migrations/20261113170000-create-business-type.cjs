'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Table banao ──────────────────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_types', {

      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // code: Unique machine-readable code — e.g., "BT01"
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },

      // name: Display label — e.g., "Manufacturer"
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
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
    await queryInterface.dropTable('business_types');
  }
};
