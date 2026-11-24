import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey
} from "sequelize";
import { sequelize } from "../config/database.js";
import { BusinessEntity } from "./BusinessEntity.model.js";

export class StatutoryIdentifier extends Model<
  InferAttributes<StatutoryIdentifier, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<StatutoryIdentifier, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<BusinessEntity["id"]>;
  declare gstin: CreationOptional<string | null>;
  declare pan: CreationOptional<string | null>;
  declare cin: CreationOptional<string | null>;
  declare udyamMsme: CreationOptional<string | null>;
  declare iecCode: CreationOptional<string | null>;
  declare tan: CreationOptional<string | null>;
  declare duns: CreationOptional<string | null>;
  declare dunsNumber: CreationOptional<string | null>;
  declare lei: CreationOptional<string | null>;
  declare mcaStatus: CreationOptional<string>;
  declare gstnStatus: CreationOptional<string>;
  declare filingFrequency: CreationOptional<string>;
  declare directorDins: CreationOptional<object[]>;
  declare statutoryPayload: CreationOptional<object>;
  declare lastSyncedAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

StatutoryIdentifier.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    businessId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    },
    gstin: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },
    pan: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    cin: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true
    },
    udyamMsme: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    iecCode: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    tan: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    duns: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dunsNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    lei: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    mcaStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "ACTIVE"
    },
    gstnStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "ACTIVE"
    },
    filingFrequency: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Monthly (GSTR-3B)"
    },
    directorDins: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    statutoryPayload: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "StatutoryIdentifier",
    tableName: "statutory_identifiers",
    timestamps: true
  }
);

export default StatutoryIdentifier;