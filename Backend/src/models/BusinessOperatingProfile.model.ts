import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessOperatingProfile extends Model<
  InferAttributes<BusinessOperatingProfile, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessOperatingProfile, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;

  declare yearsInBusiness: CreationOptional<string | null>;
  declare numberOfFacilities: CreationOptional<string | null>;
  declare annualTurnoverRange: CreationOptional<string | null>;
  declare totalWorkforce: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessOperatingProfile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: "business_entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    yearsInBusiness: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    numberOfFacilities: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    annualTurnoverRange: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    totalWorkforce: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BusinessOperatingProfile",
    tableName: "business_operating_profiles",
    timestamps: true,
  }
);

export default BusinessOperatingProfile;
