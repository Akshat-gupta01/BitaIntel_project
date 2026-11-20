import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database.js";
import type Role from "./Role.model.js";

export class Permission extends Model<
  InferAttributes<Permission, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Permission, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare module: string;
  declare action: string;
  declare name: string;
  declare description: CreationOptional<string | null>;

  declare roles?: NonAttribute<Role[]>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: true,
  }
);

export default Permission;
