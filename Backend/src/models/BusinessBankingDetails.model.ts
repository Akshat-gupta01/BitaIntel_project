import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessBankingDetails extends Model<
  InferAttributes<BusinessBankingDetails, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessBankingDetails, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare accountHolderName: string;
  declare bankName: string;
  declare accountType: CreationOptional<string>;
  declare accountNumber: string;
  declare ifscCode: string;
  declare swiftBicCode: CreationOptional<string | null>;
  declare bankBranch: CreationOptional<string | null>;
  declare bankCountry: CreationOptional<string>;
  declare bankProofDoc: CreationOptional<string | null>;
  declare isBankVerified: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessBankingDetails.init(
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
    accountHolderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Account holder name is required" },
      },
    },
    bankName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Bank name is required" },
      },
    },
    accountType: {
      type: DataTypes.ENUM(
        "Current Account",
        "Cash Credit / Overdraft",
        "Foreign Currency Account"
      ),
      allowNull: false,
      defaultValue: "Current Account",
    },
    accountNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Account number is required" },
      },
    },
    ifscCode: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: "IFSC code is required" },
      },
    },
    swiftBicCode: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    bankBranch: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    bankCountry: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "India",
    },
    bankProofDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isBankVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "business_banking_details",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId"],
      },
    ],
  }
);

export default BusinessBankingDetails;
