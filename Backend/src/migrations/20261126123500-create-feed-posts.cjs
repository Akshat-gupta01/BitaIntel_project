'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feed_posts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      slug: {
        type: Sequelize.STRING(180),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      mediaType: {
        type: Sequelize.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      category: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'Platform Update',
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      readTime: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: '3 min read',
      },
      pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      authorName: {
        type: Sequelize.STRING(150),
        allowNull: false,
        defaultValue: 'BITAINTEL Editorial & Compliance Desk',
      },
      authorRole: {
        type: Sequelize.STRING(150),
        allowNull: false,
        defaultValue: 'Platform Administration',
      },
      authorBadge: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'Official Admin',
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      highlightMetric: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      imageAlt: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },
      imageCaption: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      videoUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      posterUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      videoDuration: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      videoChapters: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      relatedLink: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feed_posts');
  },
};
