import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class VendorCategory extends Model<
  InferAttributes<VendorCategory, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<VendorCategory, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare categoryId: string;
  declare categoryName: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

VendorCategory.init(
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
    categoryId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    categoryName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VendorCategory",
    tableName: "vendor_categories",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId", "categoryId"],
      },
    ],
  }
);

export default VendorCategory;
