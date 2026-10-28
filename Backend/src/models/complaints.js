'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class complaints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      complaints.belongsTo(models.business_profiles, { foreignKey: 'business_id', as: 'business' });

      complaints.belongsTo(models.User, { foreignKey: 'user_id', as: 'filed_by' });
    }
  }
  complaints.init({
   id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id:{
        type:DataTypes.INTEGER,
        references:{
          model:"users",
          key:"id"
        }
      },
      business_id:{
        type:DataTypes.INTEGER,
        references:{
          model:"business_profiles",
          key:"id"
        }
      },
      category:{
        type:DataTypes.ENUM("Documentation","Service Quality","Payment Dispute","Misrepresentation","Other"),
        defaultValue:"Documentation"
      },
      priority:{
        type:DataTypes.ENUM("Low","Medium","High"),
        defaultValue:"Medium"
      },

      description:{
        type:DataTypes.TEXT,
        allowNull:false
      },
      subject: {
        type: DataTypes.STRING
      },
      status:{
        type:DataTypes.ENUM("Open","in_progress","Closed","Resolved"),
        defaultValue:"Open"
      },
      admin_response:{
        type:DataTypes.TEXT,
        allowNull:true
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
    modelName: 'complaints',
  });
  return complaints;
};