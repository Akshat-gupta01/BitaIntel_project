'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class business_profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      business_profiles.belongsTo(models.User,{
        foreignKey:'user_id',
        as:'user'
      });

      business_profiles.hasMany(models.inquiries, {
        foreignKey: 'business_id',
        as: 'inquiries'
      });

      business_profiles.hasMany(models.complaints, 
        { foreignKey: 'business_id',
          as: 'complaints' 
        });

      business_profiles.hasMany(models.verification, {
        foreignKey: 'business_id',
        as: 'verifications'
      });
    }
  }

  
  business_profiles.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id:{
        type: DataTypes.INTEGER,
        allowNull:true,
        references:{
          model:"users",
          key:"id"
        }
        
      },
      business_name: {
        type: DataTypes.STRING
      },
      legal_name:{
        type: DataTypes.STRING,
        allowNull:true
      },
      industry: {
        type: DataTypes.STRING
      },
      business_email:{
        type: DataTypes.STRING
      },
      business_phone:{
        type: DataTypes.STRING
      },
      business_address:{
        type: DataTypes.TEXT
      },
      city:{
        type: DataTypes.STRING
      },
      state:{
        type: DataTypes.STRING
      },
      gst_number:{
        type: DataTypes.STRING
      },
      website:{
        type: DataTypes.STRING,
        allowNull:true
      },
      description:{
        type: DataTypes.TEXT
      },
      documents_url:{
        type: DataTypes.JSON,
        allowNull:true,
        defaultValue:[]
        
      },
      verification_status:{
        type: DataTypes.ENUM("pending", "under_review", "clarification_required", "approved", "rejected", "suspended"),
        defaultValue:"pending"
      },
      rejection_reason:{
        type: DataTypes.TEXT
      },
      score: {
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        allowNull: false
      },
      level: {
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        allowNull: false
      },
      clarification_notes:{
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
    modelName: 'business_profiles',
  });
  return business_profiles;
};