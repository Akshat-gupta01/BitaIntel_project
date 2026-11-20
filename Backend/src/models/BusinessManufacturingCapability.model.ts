import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessManufacturingCapability extends Model<
  InferAttributes<BusinessManufacturingCapability, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessManufacturingCapability, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;

  declare manufacturingProcesses: CreationOptional<string | null>;
  declare machineryEquipment: CreationOptional<string | null>;
  declare installedCapacity: CreationOptional<string | null>;
  declare availableCapacity: CreationOptional<string | null>;
  declare hasRdLab: CreationOptional<boolean>;
  declare hasQcLab: CreationOptional<boolean>;
  declare offersCustomDevelopment: CreationOptional<boolean>;
  declare manufacturingLicenceDoc: CreationOptional<string | null>;
  declare facilityPhotos: CreationOptional<string[] | null>;
  declare technicalAuditDoc: CreationOptional<string | null>;
  declare testingCapabilities: CreationOptional<string | null>;
  declare qualityAssuranceProcedures: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessManufacturingCapability.init(
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
    manufacturingProcesses: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    machineryEquipment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    installedCapacity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    availableCapacity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    hasRdLab: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasQcLab: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    offersCustomDevelopment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    manufacturingLicenceDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    facilityPhotos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    technicalAuditDoc: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    testingCapabilities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    qualityAssuranceProcedures: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "BusinessManufacturingCapability",
    tableName: "business_manufacturing_capabilities",
    timestamps: true,
  }
);

export default BusinessManufacturingCapability;
