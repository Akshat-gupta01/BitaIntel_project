import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type ContactInquiryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export class ContactInquiry extends Model<
  InferAttributes<ContactInquiry, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<ContactInquiry, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare ticketId: string;
  declare name: string;
  declare email: string;
  declare company: CreationOptional<string | null>;
  declare category: CreationOptional<string>;
  declare message: string;
  declare status: CreationOptional<ContactInquiryStatus>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ContactInquiry.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ticketId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "General Enquiry",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
  },
  {
    sequelize,
    tableName: "contact_inquiries",
    timestamps: true,
  }
);

export default ContactInquiry;
