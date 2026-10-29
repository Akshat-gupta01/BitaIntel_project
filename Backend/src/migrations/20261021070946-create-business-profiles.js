'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },

      // ==================== 1. COMPANY DETAILS ====================
      business_name: {
        type: Sequelize.STRING
      },
      trade_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      legal_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      constitution: {
        type: Sequelize.ENUM('Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship', 'Trust', 'Society'),
        allowNull: true
      },
      incorporation_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      industry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      employee_count: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      brochure_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      business_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      business_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // ==================== 2. REGISTERED ADDRESSES ====================
      business_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        defaultValue: 'India'
      },
      corporate_office_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      billing_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      additional_plants: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },

      // ==================== 3. BUSINESS IDENTITY (TAX & LEGAL IDs) ====================
      gst_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      llpin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      udyam: {
        type: Sequelize.STRING,
        allowNull: true
      },
      iec: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      duns: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lei: {
        type: Sequelize.STRING,
        allowNull: true
      },

      // ==================== 4. COMPANY STRUCTURE & PERSONNEL ====================
      authorized_signatory_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      authorized_signatory_designation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      branches_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      manufacturing_facilities: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      key_personnel: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },

      // ==================== 5. DOCUMENTS & VERIFICATION STATUS ====================
      documents_url: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      verification_status: {
        type: Sequelize.ENUM("pending", "under_review", "clarification_required", "approved", "rejected", "suspended"),
        defaultValue: "pending"
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      clarification_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('business_profiles');
  }
};
