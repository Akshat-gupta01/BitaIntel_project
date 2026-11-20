import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional
} from "sequelize";
import { sequelize } from "../config/database.js";

export class UserOTP extends Model<
  InferAttributes<UserOTP, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<UserOTP, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare targetType: "email" | "mobile";
  declare targetValue: string;
  declare otpCode: string;
  declare purpose: CreationOptional<"registration" | "login" | "password_reset">;
  declare attempts: CreationOptional<number>;
  declare maxAttempts: CreationOptional<number>;
  declare isConsumed: CreationOptional<boolean>;
  declare expiresAt: Date;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserOTP.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    targetType: {
      type: DataTypes.ENUM("email", "mobile"),
      allowNull: false
    },
    targetValue: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    otpCode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "registration"
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    isConsumed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "UserOTP",
    tableName: "user_otps",
    timestamps: true
  }
);

export default UserOTP;
