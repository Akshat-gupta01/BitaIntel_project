import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional
} from "sequelize";
import { sequelize } from "../config/database.js";

export class User extends Model<
  InferAttributes<User, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<User, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare companyName: string;
  declare email: string;
  declare mobile: string;
  declare fullName: string;
  declare passwordHash: string;
  declare role: CreationOptional<string>;
  declare designation: CreationOptional<string>;
  declare isEmailVerified: CreationOptional<boolean>;
  declare isMobileVerified: CreationOptional<boolean>;
  declare status: CreationOptional<string>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    mobile: {
      type: DataTypes.STRING(25),
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "vendor"
    },
    designation: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "Director / Authorized Signatory"
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isMobileVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "ACTIVE"
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true
  }
);

export default User;
