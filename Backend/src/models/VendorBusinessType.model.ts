import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class VendorBusinessType extends Model<
  InferAttributes<VendorBusinessType, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<VendorBusinessType, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare businessTypeCode: string;
  declare businessTypeName: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

VendorBusinessType.init(
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
    businessTypeCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    businessTypeName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "VendorBusinessType",
    tableName: "vendor_business_types",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId", "businessTypeCode"],
      },
    ],
  }
);

export default VendorBusinessType;
