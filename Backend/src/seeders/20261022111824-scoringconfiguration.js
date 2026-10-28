'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('scoringconfigurations', [
      {
        name: 'Identity Verification',
        description: 'Verifies the identity of the vendor',
        weight: 20,
        is_active: true
    },
    {
        name: 'Government Identifier Verification',
        description: 'Verifies government-issued identifiers',
        weight: 20,
        is_active: true,
      },
      {
        name: 'Document Verification',
        description: 'Verifies submitted business documents',
        weight: 20,
        is_active: true,
      },
      {
        name: 'Profile Completeness',
        description: 'Checks completeness of the business profile',
        weight: 15,
        is_active: true,
      },
      {
        name: 'Business Age',
        description: 'Evaluates the age of the business',
        weight: 10,
        is_active: true,
      },
      {
        name: 'Contact Verification',
        description: 'Verifies business contact information',
        weight: 5,
        is_active: true,
      },
      {
        name: 'Address Verification',
        description: 'Verifies the registered business address',
        weight: 5,
        is_active: true,
      },
      {
        name: 'Website Verification',
        description: 'Checks the business website',
        weight: 5,
        is_active: true,
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('scoringconfigurations', null, {});
  }
};
