'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class business_profiles extends Model {
    static associate(models) {
      business_profiles.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      business_profiles.hasMany(models.inquiries, {
        foreignKey: 'business_id',
        as: 'inquiries'
      });

      business_profiles.hasMany(models.complaints, {
        foreignKey: 'business_id',
        as: 'complaints'
      });

      business_profiles.hasMany(models.verification, {
        foreignKey: 'business_id',
        as: 'verifications'
      });
    }
  }

  business_profiles.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id"
      }
    },

    // ==================== 1. COMPANY DETAILS ====================
    business_name: {
      type: DataTypes.STRING
    },
    trade_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    legal_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    constitution: {
      type: DataTypes.ENUM('Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Sole Proprietorship', 'Trust', 'Society'),
      allowNull: true
    },
    incorporation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employee_count: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    brochure_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    business_email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    business_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // ==================== 2. REGISTERED ADDRESSES ====================
    business_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'India'
    },
    corporate_office_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    additional_plants: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    // ==================== 3. BUSINESS IDENTITY (TAX & LEGAL IDs) ====================
    gst_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    llpin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    udyam: {
      type: DataTypes.STRING,
      allowNull: true
    },
    iec: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tan: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duns: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lei: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // ==================== 4. COMPANY STRUCTURE & PERSONNEL ====================
    authorized_signatory_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authorized_signatory_designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branches_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    manufacturing_facilities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    key_personnel: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },

    // ==================== 5. DOCUMENTS & VERIFICATION STATUS ====================
    documents_url: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    verification_status: {
      type: DataTypes.ENUM("pending", "under_review", "clarification_required", "approved", "rejected", "suspended"),
      defaultValue: "pending"
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    clarification_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'business_profiles',
  });
  return business_profiles;
};
