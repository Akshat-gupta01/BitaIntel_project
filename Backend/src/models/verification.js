'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      verification.belongsTo(models.business_profiles, {
        foreignKey: 'business_id',
        as: 'businessProfile'
      });
      verification.belongsTo(models.User, {
        foreignKey: 'verifier_id',
        as: 'verifier'
      });
    }
  }
  verification.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      business_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'business_profiles',
          key: 'id'
        }
      },
       verifier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
      },

      verification_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected','under_review','clarification_required'),
        defaultValue:'pending',
      },
      clarification_notes:{
        type: DataTypes.TEXT,
        allowNull: true
      },
      rejection_reason: {
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
    modelName: 'verification',
  });
  return verification;
};