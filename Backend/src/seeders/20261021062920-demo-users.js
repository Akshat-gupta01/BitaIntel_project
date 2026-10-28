'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name:'superAdmin',
        email:'superadmin@bitintel.com',
        phone:'+919800000001',
        role_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        name:'admin',
        email:'admin@bitintel.com',
        phone:'+919800000002',
        role_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        name:'verificationteam',
        email:'verificationteam@bitintel.com',
        phone:'+919800000003',
        role_id:3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        name:'supportteam',
        email:'supportteam@bitintel.com',
        phone:'+919800000004',
        role_id:4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
