import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database.js";
import type Permission from "./Permission.model.js";

export class Role extends Model<
  InferAttributes<Role, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Role, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare label: CreationOptional<string>;
  declare description: CreationOptional<string | null>;
  declare isSystem: CreationOptional<boolean>;
  declare isActive: CreationOptional<boolean>;

  declare permissions?: NonAttribute<Permission[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "",
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
  }
);

export default Role;
