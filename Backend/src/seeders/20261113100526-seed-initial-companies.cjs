'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('business_entities', [
      {
        name: 'Meridian Steel Works',
        legalName: 'Meridian Steel Works',
        slug: 'meridian-steel-works',
        initials: 'MS',
        industry: 'Manufacturing',
        city: 'Pune',
        state: 'Maharashtra',
        score: 96.00,
        badge: 'Platinum',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Nexora Cloud Systems',
        legalName: 'Nexora Cloud Systems',
        slug: 'nexora-cloud-systems',
        initials: 'NC',
        industry: 'IT Services',
        city: 'Bengaluru',
        state: 'Karnataka',
        score: 94.00,
        badge: 'Platinum',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'GreenLeaf Bio Extracts',
        legalName: 'GreenLeaf Bio Extracts',
        slug: 'greenleaf-bio-extracts',
        initials: 'GL',
        industry: 'Healthcare & Pharma',
        city: 'Nashik',
        state: 'Maharashtra',
        score: 93.00,
        badge: 'Gold',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Aurora Clean Energy',
        legalName: 'Aurora Clean Energy',
        slug: 'aurora-clean-energy',
        initials: 'AC',
        industry: 'Renewable Energy',
        city: 'Ahmedabad',
        state: 'Gujarat',
        score: 91.00,
        badge: 'Gold',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'ProPack Sustainable',
        legalName: 'ProPack Sustainable',
        slug: 'propack-sustainable',
        initials: 'PS',
        industry: 'Packaging',
        city: 'Chennai',
        state: 'Tamil Nadu',
        score: 88.00,
        badge: 'Gold',
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('business_entities', {
      slug: [
        'meridian-steel-works',
        'nexora-cloud-systems',
        'greenleaf-bio-extracts',
        'aurora-clean-energy',
        'propack-sustainable'
      ]
    });
  }
};

