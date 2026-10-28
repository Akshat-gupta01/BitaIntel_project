'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  otp.init({
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      phone:{
        type:DataTypes.STRING,
        allowNull:false,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      email:{
        type: DataTypes.STRING,
        allowNull:false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull:false,
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
    modelName: 'otp',
  });
  return otp;
};