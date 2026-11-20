import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";
import type { User } from "./User.model.js";

export class DocumentVault extends Model<
  InferAttributes<DocumentVault, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<DocumentVault, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare categoryKey: string;
  declare categoryName: string;
  declare moduleCode: CreationOptional<string>;
  declare fileName: string;
  declare fileUrl: string;
  declare fileSizeBytes: number;
  declare mimeType: string;
  declare sha256Checksum: CreationOptional<string | null>;
  declare version: CreationOptional<string>;
  declare status: CreationOptional<
    "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED" | "ACTION_REQUIRED"
  >;
  declare issueDate: CreationOptional<string | null>;
  declare expiryDate: CreationOptional<string | null>;
  declare rejectionReason: CreationOptional<string | null>;
  declare verifierName: CreationOptional<string | null>;
  declare verifiedBy: CreationOptional<ForeignKey<User["id"]> | null>;
  declare verifiedAt: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

DocumentVault.init(
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
    categoryKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Document category key is required" },
      },
    },
    categoryName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Document category name is required" },
      },
    },
    moduleCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Module A",
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileSizeBytes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sha256Checksum: {
      type: DataTypes.CHAR(64),
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "v1.0",
    },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "VERIFIED",
        "REJECTED",
        "EXPIRED",
        "ACTION_REQUIRED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verifierName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    verifiedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "document_vault",
    timestamps: true,
    indexes: [
      { fields: ["businessId"] },
      { fields: ["businessId", "categoryKey"] },
    ],
  }
);

export default DocumentVault;
