'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const exists = tables.some((t) => String(t).toLowerCase() === 'complaints');
    if (exists) {
      return;
    }

    await queryInterface.createTable('complaints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      complaintNumber: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      businessId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'business_entities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      complainantUserId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      complainantName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      complainantEmail: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      complainantCompany: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM(
          'QUALITY_ISSUE',
          'DELIVERY_DEFAULT',
          'MISREPRESENTATION',
          'STATUTORY_NON_COMPLIANCE',
          'FRAUD',
          'OTHER'
        ),
        allowNull: false,
        defaultValue: 'OTHER',
      },
      severity: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'MEDIUM',
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      evidenceUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      resolvedBy: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('complaints', ['businessId']);
    await queryInterface.addIndex('complaints', ['status']);
    await queryInterface.addIndex('complaints', ['complainantUserId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('complaints');
  },
};
