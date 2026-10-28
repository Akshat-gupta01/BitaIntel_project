'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class rolepermission extends Model {
    static associate(models) {
      rolepermission.belongsTo(models.role, {
        foreignKey: 'role_id',
        as: 'role'
      });
      rolepermission.belongsTo(models.permission, {
        foreignKey: 'permission_id',
        as: 'permission'
      });
    }
  }

  rolepermission.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'rolepermission',
  });

  return rolepermission;
};