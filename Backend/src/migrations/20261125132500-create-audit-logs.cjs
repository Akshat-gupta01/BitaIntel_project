'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const exists = tables.some((t) => String(t).toLowerCase() === 'audit_logs');
    if (exists) {
      return;
    }

    await queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      actorUserId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      actorName: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      actorRole: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      action: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      targetType: {
        type: Sequelize.ENUM('BUSINESS', 'DOCUMENT', 'COMPLAINT', 'ENQUIRY', 'ROLE', 'PERMISSION'),
        allowNull: false,
      },
      targetId: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      companyName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(64),
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

    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['targetType']);
    await queryInterface.addIndex('audit_logs', ['actorUserId']);
    await queryInterface.addIndex('audit_logs', ['createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};
