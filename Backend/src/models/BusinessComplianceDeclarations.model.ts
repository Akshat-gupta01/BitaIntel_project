import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessComplianceDeclarations extends Model<
  InferAttributes<BusinessComplianceDeclarations, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessComplianceDeclarations, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare lawfullyScreened: CreationOptional<boolean>;
  declare noConflictOfInterest: CreationOptional<boolean>;
  declare sanctionsFreeDeclaration: CreationOptional<boolean>;
  declare authorityConsent: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessComplianceDeclarations.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: "business_entities",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    lawfullyScreened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    noConflictOfInterest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    sanctionsFreeDeclaration: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    authorityConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "business_compliance_declarations",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId"],
      },
    ],
  }
);

export default BusinessComplianceDeclarations;
