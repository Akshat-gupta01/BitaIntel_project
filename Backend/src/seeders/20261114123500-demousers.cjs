'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
    const now = new Date();

    // Idempotency check: duplicate email error se bachne ke liye check karo
    const [existingUsers] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'admin@bitaintel.com' LIMIT 1;"
    );

    if (existingUsers && existingUsers.length > 0) {
      console.log('Super Admin already exists. Skipping insertion.');
      return;
    }

    await queryInterface.bulkInsert('users', [
      {
        fullName: 'Super Administrator',
        companyName: 'BITAINTEL Operations',
        email: 'admin@bitaintel.com',
        mobile: '+91 99999 00001',
        passwordHash: hashedPassword,
        role: 'super_admin',
        designation: 'Platform Head',
        isEmailVerified: true,
        isMobileVerified: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@bitaintel.com' }, {});
  },
};
