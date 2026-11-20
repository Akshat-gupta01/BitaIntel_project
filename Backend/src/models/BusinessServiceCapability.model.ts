import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessServiceCapability extends Model<
  InferAttributes<BusinessServiceCapability, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessServiceCapability, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;

  declare serviceTypes: CreationOptional<string | null>;
  declare serviceExpertise: CreationOptional<string | null>;
  declare geographicCoverage: CreationOptional<string | null>;
  declare deliveryCapacity: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessServiceCapability.init(
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
    serviceTypes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    serviceExpertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    geographicCoverage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deliveryCapacity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BusinessServiceCapability",
    tableName: "business_service_capabilities",
    timestamps: true,
  }
);

export default BusinessServiceCapability;
