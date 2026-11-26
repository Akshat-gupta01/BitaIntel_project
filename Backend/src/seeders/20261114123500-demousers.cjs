'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
    const now = new Date();

    const demoUsers = [
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
      {
        fullName: 'Platform Administrator',
        companyName: 'BITAINTEL Operations',
        email: 'ops.admin@bitaintel.com',
        mobile: '+91 99999 00002',
        passwordHash: hashedPassword,
        role: 'admin',
        designation: 'Operations Administrator',
        isEmailVerified: true,
        isMobileVerified: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: 'Verification Officer',
        companyName: 'BITAINTEL Compliance Desk',
        email: 'verifier@bitaintel.com',
        mobile: '+91 99999 00003',
        passwordHash: hashedPassword,
        role: 'verification_officer',
        designation: 'Statutory Verification Officer',
        isEmailVerified: true,
        isMobileVerified: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: 'Quality Auditor',
        companyName: 'BITAINTEL Quality Desk',
        email: 'auditor@bitaintel.com',
        mobile: '+91 99999 00004',
        passwordHash: hashedPassword,
        role: 'quality_auditor',
        designation: 'Lead Quality & ISO Auditor',
        isEmailVerified: true,
        isMobileVerified: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: 'Support Specialist',
        companyName: 'BITAINTEL Support Desk',
        email: 'support@bitaintel.com',
        mobile: '+91 99999 00005',
        passwordHash: hashedPassword,
        role: 'support_team',
        designation: 'Enterprise Support Specialist',
        isEmailVerified: true,
        isMobileVerified: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const emails = demoUsers.map((u) => u.email);
    const [existingUsers] = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (:emails);',
      { replacements: { emails } }
    );
    const existingEmailSet = new Set((existingUsers || []).map((row) => String(row.email).toLowerCase()));
    const usersToInsert = demoUsers.filter((u) => !existingEmailSet.has(u.email.toLowerCase()));

    if (usersToInsert.length === 0) {
      console.log('All demo admin/staff users already exist. Skipping insertion.');
      return;
    }

    await queryInterface.bulkInsert('users', usersToInsert);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'users',
      {
        email: [
          'admin@bitaintel.com',
          'ops.admin@bitaintel.com',
          'verifier@bitaintel.com',
          'auditor@bitaintel.com',
          'support@bitaintel.com',
        ],
      },
      {}
    );
  },
};
