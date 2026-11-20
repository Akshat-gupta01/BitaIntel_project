'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: Top B2B Trade Currencies seed karo (INR, USD, EUR, AED, SAR, etc.) ─
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('currencies', [
      // 1. Domestic India
      {
        code: 'INR',
        name: 'Indian Rupee',
        symbol: '₹',
        country: 'India',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      // 2. Global Benchmarks
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        country: 'United States',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        country: 'European Union',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      // 3. Middle East / Gulf Trade Currencies (Key for Indian B2B Exporters)
      {
        code: 'AED',
        name: 'UAE Dirham',
        symbol: 'د.إ',
        country: 'United Arab Emirates',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'SAR',
        name: 'Saudi Riyal',
        symbol: '﷼',
        country: 'Saudi Arabia',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'QAR',
        name: 'Qatari Riyal',
        symbol: '﷼',
        country: 'Qatar',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'KWD',
        name: 'Kuwaiti Dinar',
        symbol: 'د.ك',
        country: 'Kuwait',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'OMR',
        name: 'Omani Rial',
        symbol: '﷼',
        country: 'Oman',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'BHD',
        name: 'Bahraini Dinar',
        symbol: '.د.ب',
        country: 'Bahrain',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      // 4. Major International Trade Partners
      {
        code: 'GBP',
        name: 'British Pound Sterling',
        symbol: '£',
        country: 'United Kingdom',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        country: 'Singapore',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        country: 'Japan',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        country: 'China',
        isCommon: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: 'C$',
        country: 'Canada',
        isCommon: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'AUD',
        name: 'Australian Dollar',
        symbol: 'A$',
        country: 'Australia',
        isCommon: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        code: 'CHF',
        name: 'Swiss Franc',
        symbol: 'CHF',
        country: 'Switzerland',
        isCommon: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  // ─── DOWN: Rollback ────────────────────────────────────────────────────────
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('currencies', null, {});
  },
};
