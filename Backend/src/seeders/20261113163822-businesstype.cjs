'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: 14 Business Types seed karo ──────────────────────────────────────
  async up(queryInterface, Sequelize) {
    const now = new Date(); // Current timestamp — createdAt/updatedAt ke liye

    await queryInterface.bulkInsert('business_types', [
      { code: 'BT01', name: 'Manufacturer',                          createdAt: now, updatedAt: now },
      { code: 'BT02', name: 'Original Equipment Manufacturer (OEM)', createdAt: now, updatedAt: now },
      { code: 'BT03', name: 'Contract Manufacturer',                 createdAt: now, updatedAt: now },
      { code: 'BT04', name: 'Trader',                                createdAt: now, updatedAt: now },
      { code: 'BT05', name: 'Wholesaler',                            createdAt: now, updatedAt: now },
      { code: 'BT06', name: 'Distributor',                           createdAt: now, updatedAt: now },
      { code: 'BT07', name: 'Dealer',                                createdAt: now, updatedAt: now },
      { code: 'BT08', name: 'Stockist',                              createdAt: now, updatedAt: now },
      { code: 'BT09', name: 'Importer',                              createdAt: now, updatedAt: now },
      { code: 'BT10', name: 'Exporter',                              createdAt: now, updatedAt: now },
      { code: 'BT11', name: 'Service Provider',                      createdAt: now, updatedAt: now },
      { code: 'BT12', name: 'Consultant',                            createdAt: now, updatedAt: now },
      { code: 'BT13', name: 'Agent',                                 createdAt: now, updatedAt: now },
      { code: 'BT14', name: 'Retailer',                              createdAt: now, updatedAt: now },
    ]);
  },

  // ─── DOWN: Saare business types delete karo (rollback) ───────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_types', null, {});
  }
};
