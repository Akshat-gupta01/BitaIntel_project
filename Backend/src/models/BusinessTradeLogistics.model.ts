import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class BusinessTradeLogistics extends Model<
  InferAttributes<BusinessTradeLogistics, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessTradeLogistics, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare businessId: ForeignKey<number>;
  declare importerExporterStatus: CreationOptional<string>;
  declare iecNumber: CreationOptional<string | null>;
  declare sourcingCountries: CreationOptional<string | null>;
  declare exportMarkets: CreationOptional<string | null>;
  declare annualTradeTurnover: CreationOptional<string | null>;
  declare preferredIncoterms: CreationOptional<string[]>;
  declare freightArrangements: CreationOptional<string | null>;
  declare customsClearanceAssistance: CreationOptional<boolean>;
  declare exportPackagingStandards: CreationOptional<string | null>;
  declare coldChainCapability: CreationOptional<boolean>;
  declare tradeReferences: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessTradeLogistics.init(
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
    importerExporterStatus: {
      type: DataTypes.ENUM(
        "Domestic Only",
        "Exporter Only",
        "Importer Only",
        "Both Importer & Exporter"
      ),
      allowNull: false,
      defaultValue: "Domestic Only",
    },
    iecNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sourcingCountries: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    exportMarkets: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    annualTradeTurnover: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    preferredIncoterms: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["FOB"],
    },
    freightArrangements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customsClearanceAssistance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    exportPackagingStandards: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coldChainCapability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tradeReferences: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "business_trade_logistics",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["businessId"],
      },
    ],
  }
);

export default BusinessTradeLogistics;
