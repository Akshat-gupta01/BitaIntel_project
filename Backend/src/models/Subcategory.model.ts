import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

// ─── User model jaisa modern Sequelize structure ───────────────────────────
export class Subcategory extends Model<
  InferAttributes<Subcategory, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Subcategory, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare name: string;
  declare categoryCode: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Subcategory.init(
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
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    categoryCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Subcategory",
    tableName: "subcategories",
    timestamps: true,
    indexes: [
      {
        name: "idx_subcategories_category_code",
        fields: ["categoryCode"],
      },
    ],
  }
);

export default Subcategory;
