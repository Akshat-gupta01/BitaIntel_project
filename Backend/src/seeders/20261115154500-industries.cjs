'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: 10 Industries seed karo ──────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('industries', [
      { code: 'IND01', name: 'Manufacturing',    createdAt: now, updatedAt: now },
      { code: 'IND02', name: 'IT Services',      createdAt: now, updatedAt: now },
      { code: 'IND03', name: 'Electronics',      createdAt: now, updatedAt: now },
      { code: 'IND04', name: 'Food & Beverage',  createdAt: now, updatedAt: now },
      { code: 'IND05', name: 'Pharmaceuticals',  createdAt: now, updatedAt: now },
      { code: 'IND06', name: 'Logistics',        createdAt: now, updatedAt: now },
      { code: 'IND07', name: 'Textile',          createdAt: now, updatedAt: now },
      { code: 'IND08', name: 'Construction',     createdAt: now, updatedAt: now },
      { code: 'IND09', name: 'Packaging',        createdAt: now, updatedAt: now },
      { code: 'IND10', name: 'Wholesale',        createdAt: now, updatedAt: now },
    ]);
  },

  // ─── DOWN: Saari industries delete karo (rollback ke liye) ─────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('industries', null, {});
  },
};
