'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
       { code: 'CAT001', name: 'Pharmaceuticals & Healthcare' },
      { code: 'CAT002', name: 'Chemicals & Petrochemicals' },
      { code: 'CAT003', name: 'Agriculture & Food' },
      { code: 'CAT004', name: 'Industrial Manufacturing' },
      { code: 'CAT005', name: 'Machinery & Equipment' },
      { code: 'CAT006', name: 'Electrical & Electronics' },
      { code: 'CAT007', name: 'Construction & Building Materials' },
      { code: 'CAT008', name: 'Textiles & Apparel' },
      { code: 'CAT009', name: 'Packaging & Printing' },
      { code: 'CAT010', name: 'Automotive & Transportation' },
      { code: 'CAT011', name: 'IT & Telecommunications' },
      { code: 'CAT012', name: 'Professional & Business Services' },
      { code: 'CAT013', name: 'Logistics & Supply Chain' },
      { code: 'CAT014', name: 'Import, Export & Trading' },
      { code: 'CAT015', name: 'Consumer Goods & Retail' },
      { code: 'CAT016', name: 'Energy & Utilities' },
      { code: 'CAT017', name: 'Metals, Minerals & Mining' },
      { code: 'CAT018', name: 'Plastics, Rubber & Polymers' },
      { code: 'CAT019', name: 'Laboratory, Testing & Research' },
      { code: 'CAT020', name: 'Safety, Environment & Waste Management' }
    ],{});
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('categories', null, {});
  }
};
