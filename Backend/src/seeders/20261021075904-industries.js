'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('industries', [
      { name: 'Manufacturing', status: 'Active' },
      { name: 'IT Services', status: 'Active' },
      { name: 'Electronics', status: 'Active' },
      { name: 'Food & Beverage', status: 'Active' },
      { name: 'Pharmaceuticals', status: 'Active' },
      { name: 'Logistics', status: 'Active' },
      { name: 'Textile', status: 'Active' },
      { name: 'Construction', status: 'Active' },
      { name: 'Packaging', status: 'Active' },
      { name: 'Wholesale', status: 'Active' }

    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('industries', null, {});
  }
};
