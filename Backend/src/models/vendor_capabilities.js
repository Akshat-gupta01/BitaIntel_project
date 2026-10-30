'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class vendor_capabilities extends Model {
    static associate(models) {
      vendor_capabilities.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });

      vendor_capabilities.belongsTo(models.business_profiles, {
        foreignKey: 'business_profile_id',
        as: 'business_profile',
      });
    }
  }

  vendor_capabilities.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      business_profile_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'business_profiles',
          key: 'id',
        },
      },
      business_types: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      category_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      subcategory_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      business_activities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      manufacturing_capabilities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      service_capabilities: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      operating_profile: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      facility_documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      step_status: {
        type: DataTypes.ENUM('draft', 'completed'),
        allowNull: false,
        defaultValue: 'draft',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'vendor_capabilities',
    }
  );

  return vendor_capabilities;
};

