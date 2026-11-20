import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessPersonnel extends Model<
  InferAttributes<BusinessPersonnel, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessPersonnel, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare name: string;
  declare designation: string;
  declare department: CreationOptional<string | null>;
  declare email: string;
  declare mobile: string;
  declare photoUrl: CreationOptional<string | null>;
  declare isAuthorizedSignatory: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessPersonnel.init(
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Personnel name cannot be empty" },
      },
    },
    designation: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Designation cannot be empty" },
      },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: { msg: "Valid corporate email is required" },
      },
    },
    mobile: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Mobile number is required" },
      },
    },
    photoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isAuthorizedSignatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "business_personnel",
    timestamps: true,
    indexes: [
      {
        fields: ["businessId"],
      },
    ],
  }
);

export default BusinessPersonnel;
