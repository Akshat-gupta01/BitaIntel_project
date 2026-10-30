'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class subcategories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       subcategories.belongsTo(models.categories, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  subcategories.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      code:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
      status:{
        type:DataTypes.ENUM('active','inactive'),
        allowNull:false,
        defaultValue:'active'
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
    modelName: 'subcategories',
  });
  return subcategories;
};