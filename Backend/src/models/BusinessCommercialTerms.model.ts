import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessCommercialTerms extends Model<
  InferAttributes<BusinessCommercialTerms, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessCommercialTerms, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare acceptedCurrencies: CreationOptional<string[]>;
  declare paymentMethods: CreationOptional<string[]>;
  declare advancePaymentPercentage: CreationOptional<string | null>;
  declare creditTermsDays: CreationOptional<string | null>;
  declare moqPolicy: CreationOptional<string | null>;
  declare samplePolicy: CreationOptional<string | null>;
  declare warrantyTerms: CreationOptional<string | null>;
  declare returnPolicy: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessCommercialTerms.init(
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
    acceptedCurrencies: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["INR"],
    },
    paymentMethods: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["Bank Transfer (NEFT/RTGS)"],
    },
    advancePaymentPercentage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "20%",
    },
    creditTermsDays: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "30 Days Net",
    },
    moqPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    samplePolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    warrantyTerms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "business_commercial_terms",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId"],
      },
    ],
  }
);

export default BusinessCommercialTerms;
