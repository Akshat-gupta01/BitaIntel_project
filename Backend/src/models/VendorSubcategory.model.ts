import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class VendorSubcategory extends Model<
  InferAttributes<VendorSubcategory, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<VendorSubcategory, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare categoryId: string;
  declare subcategoryId: string;
  declare subcategoryName: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

VendorSubcategory.init(
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
    subcategoryId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subcategoryName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VendorSubcategory",
    tableName: "vendor_subcategories",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId", "subcategoryId"],
      },
    ],
  }
);

export default VendorSubcategory;
