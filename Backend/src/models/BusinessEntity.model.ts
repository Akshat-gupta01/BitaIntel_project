import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey
} from "sequelize";
import { sequelize } from "../config/database.js";
import type { User } from "./User.model.js";

export class BusinessEntity extends Model<
  InferAttributes<BusinessEntity, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessEntity, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare ownerUserId: CreationOptional<ForeignKey<User["id"]> | null>;
  declare slug: string;
  declare name: string;
  declare legalName: string;
  declare tradeName: CreationOptional<string | null>;
  declare companyType: CreationOptional<string>;
  declare registrationNo: CreationOptional<string | null>;
  declare initials: CreationOptional<string>;
  declare industry: CreationOptional<string>;
  declare category: CreationOptional<string | null>;
  declare location: CreationOptional<string>;
  declare city: CreationOptional<string>;
  declare state: CreationOptional<string>;
  declare registeredAddress: CreationOptional<string | null>;
  declare postalCode: CreationOptional<string | null>;
  declare country: CreationOptional<string>;
  declare website: CreationOptional<string | null>;
  declare yearEstablished: CreationOptional<number>;
  declare age: CreationOptional<number>;
  declare level: CreationOptional<number>;
  declare score: CreationOptional<number>;
  declare badge: CreationOptional<"Platinum" | "Gold" | "Silver" | "Verified" | "Under Review">;
  declare summary: CreationOptional<string | null>;
  declare turnover: CreationOptional<string>;
  declare employees: CreationOptional<string>;
  declare verified: CreationOptional<boolean>;
  declare verificationStatus: CreationOptional<string>;
  declare isPubliclyVisible: CreationOptional<boolean>;
  declare lastAudited: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessEntity.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    ownerUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    legalName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tradeName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    companyType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Private Limited Company (Pvt Ltd)"
    },
    registrationNo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    initials: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: "BE"
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Manufacturing"
    },
    category: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: "India"
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Mumbai"
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Maharashtra"
    },
    registeredAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "India"
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    yearEstablished: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2024
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    badge: {
      type: DataTypes.ENUM("Platinum", "Gold", "Silver", "Verified", "Under Review"),
      allowNull: false,
      defaultValue: "Under Review"
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    turnover: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "₹1–5 crore"
    },
    employees: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "10–50"
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verificationStatus: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "registered"
    },
    isPubliclyVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastAudited: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: "BusinessEntity",
    tableName: "business_entities",
    timestamps: true
  }
);

export default BusinessEntity;
