import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * Step 4: BusinessProduct Model
 * Stores vendor-offered products & services, specifications, HSN, capacity, and catalog/TDS proofs
 */
export class BusinessProduct extends Model<
  InferAttributes<BusinessProduct, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessProduct, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;

  // Identity & Classification
  declare name: string;
  declare type: CreationOptional<"Product" | "Service">;
  declare categoryId: string;
  declare subcategoryId: CreationOptional<string | null>;
  declare brand: CreationOptional<string | null>;
  declare description: CreationOptional<string | null>;

  // Technical Specs & Quality Standards
  declare specifications: CreationOptional<string | null>;
  declare grade: CreationOptional<string | null>;
  declare standards: CreationOptional<string | null>;
  declare hsnCode: CreationOptional<string | null>;
  declare countryOfOrigin: CreationOptional<string>;

  // Supply & Commercial Info
  declare moq: CreationOptional<string | null>;
  declare standardOrderQty: CreationOptional<string | null>;
  declare monthlyCapacity: CreationOptional<string | null>;
  declare availableStock: CreationOptional<string | null>;
  declare leadTimeDays: CreationOptional<string | null>;
  declare sampleAvailability: CreationOptional<"Available Free" | "Available Paid" | "Not Available">;
  declare indicativePrice: CreationOptional<string | null>;
  declare currency: CreationOptional<string>;
  declare priceValidity: CreationOptional<string | null>;
  declare targetMarkets: CreationOptional<string | null>;

  // Attached Documents & Images
  declare images: CreationOptional<string[] | null>;
  declare catalogueDoc: CreationOptional<string | null>;
  declare technicalDataSheetDoc: CreationOptional<string | null>;
  declare coaDoc: CreationOptional<string | null>;
  declare sdsDoc: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessProduct.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Product", "Service"),
      allowNull: false,
      defaultValue: "Product",
    },
    categoryId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subcategoryId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    standards: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    hsnCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    countryOfOrigin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "India",
    },
    moq: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    standardOrderQty: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    monthlyCapacity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    availableStock: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    leadTimeDays: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sampleAvailability: {
      type: DataTypes.ENUM("Available Free", "Available Paid", "Not Available"),
      allowNull: false,
      defaultValue: "Available Free",
    },
    indicativePrice: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "INR",
    },
    priceValidity: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    targetMarkets: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    catalogueDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    technicalDataSheetDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    coaDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sdsDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "business_products",
    timestamps: true,
    indexes: [
      { fields: ["businessId"] },
      { fields: ["categoryId"] },
    ],
  }
);
