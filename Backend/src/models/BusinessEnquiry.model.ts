import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type EnquiryStatus = "New" | "Viewed" | "Responded" | "In Discussion" | "Closed/Rejected";

/**
 * BusinessEnquiry Model
 * Stores procurement enquiries, RFQs, and partnership leads sent by buyers to vendors.
 * Linked to business_entities via businessId.
 */
export class BusinessEnquiry extends Model<
  InferAttributes<BusinessEnquiry, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<BusinessEnquiry, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare enquiryNumber: CreationOptional<string>;
  declare businessId: ForeignKey<number>;
  declare productId: CreationOptional<number | null>;
  declare productName: CreationOptional<string | null>;

  // Buyer Info
  declare buyerName: string;
  declare buyerEmail: string;
  declare buyerPhone: CreationOptional<string | null>;
  declare buyerCompany: CreationOptional<string | null>;

  // Enquiry Details
  declare subject: string;
  declare details: string;
  declare budget: CreationOptional<string | null>;
  declare status: CreationOptional<EnquiryStatus>;

  // Vendor Response
  declare replyMessage: CreationOptional<string | null>;
  declare repliedAt: CreationOptional<Date | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BusinessEnquiry.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    enquiryNumber: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: () => `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
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
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "business_products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    buyerName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    buyerEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    buyerPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    buyerCompany: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Procurement / RFQ Enquiry",
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    budget: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("New", "Viewed", "Responded", "In Discussion", "Closed/Rejected"),
      allowNull: false,
      defaultValue: "New",
    },
    replyMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "business_enquiries",
    timestamps: true,
    indexes: [
      { fields: ["businessId"] },
      { fields: ["enquiryNumber"] },
      { fields: ["status"] },
      { fields: ["createdAt"] },
    ],
  }
);

export default BusinessEnquiry;
