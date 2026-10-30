'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class business_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  business_types.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
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
    modelName: 'business_types',
  });
  return business_types;
};