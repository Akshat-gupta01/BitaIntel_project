import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type NotificationType = "VERIFICATION" | "DOCUMENT" | "COMPLIANCE" | "SYSTEM";

export class Notification extends Model<
  InferAttributes<Notification, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Notification, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare businessId: CreationOptional<number | null>;
  declare type: CreationOptional<NotificationType>;
  declare title: string;
  declare message: string;
  declare isRead: CreationOptional<boolean>;
  declare actionTab: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    businessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "business_entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("VERIFICATION", "DOCUMENT", "COMPLIANCE", "SYSTEM"),
      allowNull: false,
      defaultValue: "SYSTEM",
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    actionTab: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["businessId"] },
      { fields: ["isRead"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default Notification;
