'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: subcategories table banao ────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subcategories', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // code: Unique machine-readable code — e.g. "SUB001"
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      // name: Subcategory label — e.g. "Active Pharmaceutical Ingredients (APIs)"
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      // categoryCode: Parent category ka code — e.g. "CAT001"
      categoryCode: {
        type: Sequelize.STRING(50),
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

    // Fast search ke liye categoryCode pe index lagao
    await queryInterface.addIndex('subcategories', ['categoryCode'], {
      name: 'idx_subcategories_category_code',
    });
  },

  // ─── DOWN: Table drop karo (rollback ke liye) ─────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subcategories');
  }
};

