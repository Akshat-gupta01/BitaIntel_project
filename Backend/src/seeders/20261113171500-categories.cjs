'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: 20 Categories seed karo ──────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('categories', [
      { code: 'CAT001', name: 'Pharmaceuticals & Healthcare',             createdAt: now, updatedAt: now },
      { code: 'CAT002', name: 'Chemicals & Petrochemicals',                createdAt: now, updatedAt: now },
      { code: 'CAT003', name: 'Agriculture & Food',                        createdAt: now, updatedAt: now },
      { code: 'CAT004', name: 'Industrial Manufacturing',                  createdAt: now, updatedAt: now },
      { code: 'CAT005', name: 'Machinery & Equipment',                     createdAt: now, updatedAt: now },
      { code: 'CAT006', name: 'Electrical & Electronics',                  createdAt: now, updatedAt: now },
      { code: 'CAT007', name: 'Construction & Building Materials',         createdAt: now, updatedAt: now },
      { code: 'CAT008', name: 'Textiles & Apparel',                        createdAt: now, updatedAt: now },
      { code: 'CAT009', name: 'Packaging & Printing',                      createdAt: now, updatedAt: now },
      { code: 'CAT010', name: 'Automotive & Transportation',               createdAt: now, updatedAt: now },
      { code: 'CAT011', name: 'IT & Telecommunications',                   createdAt: now, updatedAt: now },
      { code: 'CAT012', name: 'Professional & Business Services',          createdAt: now, updatedAt: now },
      { code: 'CAT013', name: 'Logistics & Supply Chain',                  createdAt: now, updatedAt: now },
      { code: 'CAT014', name: 'Import, Export & Trading',                  createdAt: now, updatedAt: now },
      { code: 'CAT015', name: 'Consumer Goods & Retail',                   createdAt: now, updatedAt: now },
      { code: 'CAT016', name: 'Energy & Utilities',                        createdAt: now, updatedAt: now },
      { code: 'CAT017', name: 'Metals, Minerals & Mining',                 createdAt: now, updatedAt: now },
      { code: 'CAT018', name: 'Plastics, Rubber & Polymers',               createdAt: now, updatedAt: now },
      { code: 'CAT019', name: 'Laboratory, Testing & Research',            createdAt: now, updatedAt: now },
      { code: 'CAT020', name: 'Safety, Environment & Waste Management',    createdAt: now, updatedAt: now },
    ]);
  },

  // ─── DOWN: Saari categories delete karo (rollback ke liye) ────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};

