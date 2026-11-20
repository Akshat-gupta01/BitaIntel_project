import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessFacility extends Model<
  InferAttributes<BusinessFacility, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessFacility, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare facilityType: CreationOptional<string>;
  declare facilityName: string;
  declare addressLine: string;
  declare city: string;
  declare state: string;
  declare pincode: string;
  declare country: CreationOptional<string>;
  declare isOwned: CreationOptional<boolean>;
  declare plantHead: CreationOptional<string | null>;
  declare contactPhone: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessFacility.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "business_entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    facilityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Manufacturing Plant",
    },
    facilityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "India",
    },
    isOwned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    plantHead: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BusinessFacility",
    tableName: "business_facilities",
    timestamps: true,
  }
);

export default BusinessFacility;
