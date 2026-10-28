'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.role, {
        foreignKey: 'role_id',
        as: 'role'
      });

      User.hasOne(models.business_profiles,{
        foreignKey:'user_id',
        as:'business_profile'
      })

      User.hasMany(models.complaints, 
        { foreignKey: 'user_id', 
          as: 'complaints' 
        });

        User.hasMany(models.auditlog, 
          { foreignKey: 'user_id', 
            as: 'auditlogs' 
          });

    }
  }
  User.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      phone:{
        type:DataTypes.STRING,
        allowNull:true,
        unique: true
      },
      role_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      status:{
        type:DataTypes.ENUM('pending','approved','rejected','suspended'),
        defaultValue:'pending'
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
    modelName: 'User',
  });
  return User;
};