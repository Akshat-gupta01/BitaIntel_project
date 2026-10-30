'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      categories.hasMany(models.subcategories, {
        foreignKey: 'category_id',
        as: 'subcategories'
      });
    }
  }
  categories.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      code:{
         type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING
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
    modelName: 'categories',
  });
  return categories;
};