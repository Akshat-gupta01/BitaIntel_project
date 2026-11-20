import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * Currency Master Model
 * Stores international & domestic trade currencies (INR, USD, EUR, AED, SAR, etc.)
 */
export class Currency extends Model<
  InferAttributes<Currency, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Currency, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare symbol: string;
  declare country: CreationOptional<string | null>;
  declare isCommon: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Currency.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isCommon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Currency",
    tableName: "currencies",
    timestamps: true,
    indexes: [
      { fields: ["code"], unique: true },
    ],
  }
);

export default Currency;
