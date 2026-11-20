import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Industry extends Model<
  InferAttributes<Industry, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Industry, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Industry.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Industry",
    tableName: "industries",
    timestamps: true,
  }
);

export default Industry;
