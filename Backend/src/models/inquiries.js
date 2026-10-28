'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class inquiries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      inquiries.belongsTo(models.business_profiles, {
        foreignKey: 'business_id',
        as: 'business'
      });
    }
  }
  inquiries.init({
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
          model: "business_profiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: {
        type: DataTypes.STRING,
        allowNull:false
      },
      email:{
        type: DataTypes.STRING,
        allowNull:false
      },
      phone:{
        type: DataTypes.STRING,
        allowNull:false
      },
      subject:{
        type: DataTypes.STRING,
        allowNull:false
      },
      message:{
        type: DataTypes.TEXT,
        allowNull:false
      },
     status: {
        type: DataTypes.ENUM(
          "new",
          "in_progress",
          "responded",
          "closed"
        ),
        allowNull: false,
        defaultValue: "new",
      },
      admin_response:{
        type: DataTypes.TEXT,
        allowNull:true
      },
      is_spam: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      spam_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    modelName: 'inquiries',
  });
  return inquiries;
};