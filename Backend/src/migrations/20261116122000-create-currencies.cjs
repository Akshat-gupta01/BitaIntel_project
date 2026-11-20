'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: currencies master table banao ────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('currencies', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true, // e.g. "INR", "USD", "EUR", "AED", "SAR"
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false, // e.g. "Indian Rupee", "US Dollar", "Saudi Riyal"
      },
      symbol: {
        type: Sequelize.STRING(15),
        allowNull: false, // e.g. "₹", "$", "€", "د.إ", "﷼"
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      isCommon: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('currencies', ['code'], {
      name: 'idx_currencies_code',
      unique: true,
    });
  },

  // ─── DOWN: Rollback ────────────────────────────────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('currencies');
  },
};
