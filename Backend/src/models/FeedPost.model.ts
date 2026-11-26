import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type FeedMediaType = "text" | "image" | "video";

export class FeedPost extends Model<
  InferAttributes<FeedPost, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<FeedPost, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare slug: string;
  declare title: string;
  declare summary: string;
  declare content: string[];
  declare mediaType: CreationOptional<FeedMediaType>;
  declare category: CreationOptional<string>;
  declare publishedAt: CreationOptional<Date>;
  declare readTime: CreationOptional<string>;
  declare pinned: CreationOptional<boolean>;
  declare authorName: CreationOptional<string>;
  declare authorRole: CreationOptional<string>;
  declare authorBadge: CreationOptional<string>;
  declare tags: CreationOptional<string[]>;
  declare highlightMetric: CreationOptional<Record<string, string> | null>;
  declare imageUrl: CreationOptional<string | null>;
  declare imageAlt: CreationOptional<string | null>;
  declare imageCaption: CreationOptional<string | null>;
  declare videoUrl: CreationOptional<string | null>;
  declare posterUrl: CreationOptional<string | null>;
  declare videoDuration: CreationOptional<string | null>;
  declare videoChapters: CreationOptional<Array<Record<string, string>> | null>;
  declare relatedLink: CreationOptional<Record<string, string> | null>;
  declare isPublished: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FeedPost.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.ENUM("text", "image", "video"),
      allowNull: false,
      defaultValue: "text",
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Platform Update",
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    readTime: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "3 min read",
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    authorName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "BITAINTEL Editorial & Compliance Desk",
    },
    authorRole: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "Platform Administration",
    },
    authorBadge: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Official Admin",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    highlightMetric: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    imageAlt: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    imageCaption: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    posterUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    videoDuration: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    videoChapters: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    relatedLink: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "feed_posts",
    timestamps: true,
  }
);

export default FeedPost;
