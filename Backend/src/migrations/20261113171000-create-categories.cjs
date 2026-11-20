'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: categories table banao ───────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // code: Unique machine-readable category code — e.g. "CAT001"
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      // name: Category label — e.g. "Pharmaceuticals & Healthcare"
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      // createdAt: Record kab create hua
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // updatedAt: Record kab update hua
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  // ─── DOWN: Table drop karo (rollback ke liye) ─────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
};

