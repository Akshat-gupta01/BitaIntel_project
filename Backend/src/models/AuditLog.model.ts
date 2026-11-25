import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type AuditTargetType =
  | "BUSINESS"
  | "DOCUMENT"
  | "COMPLAINT"
  | "ENQUIRY"
  | "ROLE"
  | "PERMISSION";

export class AuditLog extends Model<
  InferAttributes<AuditLog, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<AuditLog, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare actorUserId: CreationOptional<number | null>;
  declare actorName: string;
  declare actorRole: string;
  declare action: string;
  declare targetType: AuditTargetType;
  declare targetId: CreationOptional<string | null>;
  declare companyName: CreationOptional<string | null>;
  declare summary: string;
  declare metadata: CreationOptional<Record<string, unknown> | null>;
  declare ipAddress: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    actorUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    actorName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    actorRole: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    targetType: {
      type: DataTypes.ENUM("BUSINESS", "DOCUMENT", "COMPLAINT", "ENQUIRY", "ROLE", "PERMISSION"),
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: true,
    indexes: [
      { fields: ["action"] },
      { fields: ["targetType"] },
      { fields: ["actorUserId"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default AuditLog;
