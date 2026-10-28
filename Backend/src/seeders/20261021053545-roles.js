'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      
      { name: 'Super Admin' },
      { name: 'Admin' },
      { name: 'Verification Team' },
      { name: 'Support Team' },
      { name: 'vendor' },
    ])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
