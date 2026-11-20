import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class VendorBusinessActivity extends Model<
  InferAttributes<VendorBusinessActivity, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<VendorBusinessActivity, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare activityName: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

VendorBusinessActivity.init(
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
    activityName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "VendorBusinessActivity",
    tableName: "vendor_business_activities",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId", "activityName"],
      },
    ],
  }
);

export default VendorBusinessActivity;
