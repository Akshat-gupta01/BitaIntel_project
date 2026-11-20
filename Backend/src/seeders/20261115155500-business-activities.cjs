'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: 8 Business Activities seed karo ──────────────────────────────────
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('business_activities', [
      { code: 'ACT01', name: 'Manufacturing',          createdAt: now, updatedAt: now },
      { code: 'ACT02', name: 'Trading',                createdAt: now, updatedAt: now },
      { code: 'ACT03', name: 'Distribution',           createdAt: now, updatedAt: now },
      { code: 'ACT04', name: 'Services',               createdAt: now, updatedAt: now },
      { code: 'ACT05', name: 'Import',                 createdAt: now, updatedAt: now },
      { code: 'ACT06', name: 'Export',                 createdAt: now, updatedAt: now },
      { code: 'ACT07', name: 'Private Label',          createdAt: now, updatedAt: now },
      { code: 'ACT08', name: 'Contract Manufacturing', createdAt: now, updatedAt: now },
    ]);
  },

  // ─── DOWN: Saari business activities delete karo (rollback ke liye) ───────
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_activities', null, {});
  },
};
