import type { Request, Response } from "express";
import { z } from "zod";
import { FeedPost } from "../models/FeedPost.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const createFeedSchema = z.object({
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().min(3).max(180).optional(),
  summary: z.string().trim().min(10),
  content: z.array(z.string().trim().min(1)).min(1),
  mediaType: z.enum(["text", "image", "video"]).optional().default("text"),
  category: z.string().trim().min(2).max(80).optional().default("Platform Update"),
  readTime: z.string().trim().max(40).optional().default("3 min read"),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string().trim()).optional().default([]),
  highlightMetric: z
    .object({
      label: z.string(),
      value: z.string(),
      context: z.string(),
    })
    .optional()
    .nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  imageAlt: z.string().trim().optional().nullable(),
  imageCaption: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().optional().nullable(),
  posterUrl: z.string().trim().optional().nullable(),
  videoDuration: z.string().trim().optional().nullable(),
  relatedLink: z
    .object({
      label: z.string(),
      href: z.string(),
    })
    .optional()
    .nullable(),
});

function formatFeedPost(post: FeedPost) {
  const json = post.toJSON() as unknown as Record<string, unknown>;
  return {
    id: String(json.id),
    slug: String(json.slug || ""),
    title: String(json.title || ""),
    summary: String(json.summary || ""),
    content: Array.isArray(json.content) ? json.content : [],
    mediaType: (json.mediaType as "text" | "image" | "video") || "text",
    category: String(json.category || "Platform Update"),
    publishedAt: json.publishedAt ? new Date(String(json.publishedAt)).toISOString() : new Date().toISOString(),
    readTime: String(json.readTime || "3 min read"),
    pinned: Boolean(json.pinned),
    author: {
      name: String(json.authorName || "BITAINTEL Editorial & Compliance Desk"),
      role: String(json.authorRole || "Platform Administration"),
      badge: String(json.authorBadge || "Official Admin"),
    },
    tags: Array.isArray(json.tags) ? json.tags : [],
    ...(json.highlightMetric ? { highlightMetric: json.highlightMetric } : {}),
    ...(json.imageUrl ? { imageUrl: json.imageUrl } : {}),
    ...(json.imageAlt ? { imageAlt: json.imageAlt } : {}),
    ...(json.imageCaption ? { imageCaption: json.imageCaption } : {}),
    ...(json.videoUrl ? { videoUrl: json.videoUrl } : {}),
    ...(json.posterUrl ? { posterUrl: json.posterUrl } : {}),
    ...(json.videoDuration ? { videoDuration: json.videoDuration } : {}),
    ...(json.videoChapters ? { videoChapters: json.videoChapters } : {}),
    ...(json.relatedLink ? { relatedLink: json.relatedLink } : {}),
  };
}

export async function getPublicFeed(req: Request, res: Response) {
  try {
    const posts = await FeedPost.findAll({
      where: { isPublished: true },
      order: [
        ["pinned", "DESC"],
        ["publishedAt", "DESC"],
      ],
    });

    return sendSuccess(res, {
      total: posts.length,
      posts: posts.map(formatFeedPost),
    });
  } catch (error) {
    console.error("Get Public Feed Error:", error);
    return sendError(res, "Failed to fetch feed posts", 500, "ERR_INTERNAL_SERVER");
  }
}

export async function createFeedPost(req: Request, res: Response) {
  try {
    const parsed = createFeedSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Validation failed", 400, "ERR_VALIDATION", parsed.error.issues);
    }

    const d = parsed.data;
    const baseSlug =
      d.slug ||
      `${d.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-4)}`;

    const created = await FeedPost.create({
      slug: baseSlug,
      title: d.title,
      summary: d.summary,
      content: d.content,
      mediaType: d.mediaType,
      category: d.category,
      publishedAt: new Date(),
      readTime: d.readTime,
      pinned: d.pinned,
      authorName: req.user?.fullName || "BITAINTEL Admin Desk",
      authorRole: req.user?.designation || "Platform Administration",
      authorBadge: "Official Admin",
      tags: d.tags,
      highlightMetric: d.highlightMetric ?? null,
      imageUrl: d.imageUrl ?? null,
      imageAlt: d.imageAlt ?? null,
      imageCaption: d.imageCaption ?? null,
      videoUrl: d.videoUrl ?? null,
      posterUrl: d.posterUrl ?? null,
      videoDuration: d.videoDuration ?? null,
      relatedLink: d.relatedLink ?? null,
      isPublished: true,
    });

    return sendSuccess(res, { post: formatFeedPost(created) }, 201);
  } catch (error) {
    console.error("Create Feed Post Error:", error);
    return sendError(res, "Failed to publish feed post", 500, "ERR_INTERNAL_SERVER");
  }
}

export async function deleteFeedPost(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return sendError(res, "Invalid feed post ID", 400, "ERR_VALIDATION");
    }

    const post = await FeedPost.findByPk(id);
    if (!post) {
      return sendError(res, "Feed post not found", 404, "ERR_NOT_FOUND");
    }

    await post.destroy();
    return sendSuccess(res, { message: "Feed post deleted" });
  } catch (error) {
    console.error("Delete Feed Post Error:", error);
    return sendError(res, "Failed to delete feed post", 500, "ERR_INTERNAL_SERVER");
  }
}
