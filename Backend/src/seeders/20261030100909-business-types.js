'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('business_types', [
      { code: 'BT01', name: 'Manufacturer', status: 'active' },
      { code: 'BT02', name: 'Original Equipment Manufacturer (OEM)', status: 'active' },
      { code: 'BT03', name: 'Contract Manufacturer', status: 'active' },
      { code: 'BT04', name: 'Trader', status: 'active' },
      { code: 'BT05', name: 'Wholesaler', status: 'active' },
      { code: 'BT06', name: 'Distributor', status: 'active' },
      { code: 'BT07', name: 'Dealer', status: 'active' },
      { code: 'BT08', name: 'Stockist', status: 'active' },
      { code: 'BT09', name: 'Importer', status: 'active' },
      { code: 'BT10', name: 'Exporter', status: 'active' },
      { code: 'BT11', name: 'Service Provider', status: 'active' },
      { code: 'BT12', name: 'Consultant', status: 'active' },
      { code: 'BT13', name: 'Agent', status: 'active' },
      { code: 'BT14', name: 'Retailer', status: 'active' }
    ], {});
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_types', null, {});
  }
};
