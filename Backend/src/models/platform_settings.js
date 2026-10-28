'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class platform_settings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  platform_settings.init({
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      platform_name: {
        type: DataTypes.STRING,
        defaultValue: 'BITAINTEL'
      },
      support_email: {
        type: DataTypes.STRING,
        defaultValue:"support@bitaintel.test"
      },
      badge_threshold: {
        type: DataTypes.INTEGER,
        defaultValue:60
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
    modelName: 'platform_settings',
  });
  return platform_settings;
};