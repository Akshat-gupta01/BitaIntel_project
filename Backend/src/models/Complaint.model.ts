import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type ComplaintCategory =
  | "QUALITY_ISSUE"
  | "DELIVERY_DEFAULT"
  | "MISREPRESENTATION"
  | "STATUTORY_NON_COMPLIANCE"
  | "FRAUD"
  | "OTHER";

export type ComplaintSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplaintStatus =
  | "OPEN"
  | "UNDER_INVESTIGATION"
  | "RESOLVED"
  | "DISMISSED";

/**
 * Complaint Model
 * Stores compliance, quality, delivery, or fraud complaints filed by authenticated buyers/vendors or admins.
 * Open/Under-Investigation complaints directly impact Governance & Risk in Trust Scoring.
 */
export class Complaint extends Model<
  InferAttributes<Complaint, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Complaint, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare complaintNumber: CreationOptional<string>;
  declare businessId: ForeignKey<number>;
  declare complainantUserId: CreationOptional<number | null>;

  // Complainant Details
  declare complainantName: string;
  declare complainantEmail: string;
  declare complainantCompany: CreationOptional<string | null>;

  // Complaint Details
  declare category: CreationOptional<ComplaintCategory>;
  declare severity: CreationOptional<ComplaintSeverity>;
  declare subject: string;
  declare description: string;
  declare evidenceUrl: CreationOptional<string | null>;

  // Resolution & Audit
  declare status: CreationOptional<ComplaintStatus>;
  declare adminNotes: CreationOptional<string | null>;
  declare resolvedBy: CreationOptional<number | null>;
  declare resolvedAt: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Complaint.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    complaintNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      defaultValue: () => `CMP-${Math.floor(100000 + Math.random() * 900000)}`,
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
    complainantUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    complainantName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    complainantEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    complainantCompany: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "QUALITY_ISSUE",
        "DELIVERY_DEFAULT",
        "MISREPRESENTATION",
        "STATUTORY_NON_COMPLIANCE",
        "FRAUD",
        "OTHER"
      ),
      allowNull: false,
      defaultValue: "OTHER",
    },
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    evidenceUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "UNDER_INVESTIGATION", "RESOLVED", "DISMISSED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "complaints",
    timestamps: true,
    indexes: [
      { fields: ["businessId"] },
      { fields: ["status"] },
      { fields: ["complainantUserId"] },
    ],
  }
);

export default Complaint;
