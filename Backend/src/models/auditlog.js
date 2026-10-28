'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class auditlog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      auditlog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    }
  }
  auditlog.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
          model: "users",
          key:"id"
        } 
      }, 
      action: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'Login', 'Vendor Update', 'Document Approved'
      },
      detail:{
        type:DataTypes.TEXT,
        allowNull: true
      },

      ip_address:{
        type: DataTypes.STRING,
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
    modelName: 'auditlog',
  });
  return auditlog;
};