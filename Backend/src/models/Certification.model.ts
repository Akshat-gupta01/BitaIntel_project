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
 * Step 4: Certification Model
 * Stores ISO, WHO-GMP, CE, BIS & Regulatory Approvals with issue/expiry dates and evidence PDFs
 */
export class Certification extends Model<
  InferAttributes<Certification, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Certification, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;

  declare category: CreationOptional<"QUALITY_CERT" | "REGULATORY_APPROVAL">;
  declare certificateType: string;
  declare certificateNumber: string;
  declare issuingAuthority: string;
  declare issueDate: CreationOptional<string | null>;
  declare expiryDate: CreationOptional<string | null>;
  declare scope: CreationOptional<string | null>;
  declare applicableFacility: CreationOptional<string>;
  declare evidenceDoc: CreationOptional<string | null>;
  declare status: CreationOptional<"Active" | "Expiring Soon" | "Expired">;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Certification.init(
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
    category: {
      type: DataTypes.ENUM("QUALITY_CERT", "REGULATORY_APPROVAL"),
      allowNull: false,
      defaultValue: "QUALITY_CERT",
    },
    certificateType: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    certificateNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    issuingAuthority: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicableFacility: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "All Facilities",
    },
    evidenceDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Active", "Expiring Soon", "Expired"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    sequelize,
    tableName: "certifications",
    timestamps: true,
    indexes: [
      { fields: ["businessId"] },
    ],
  }
);
