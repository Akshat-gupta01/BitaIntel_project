import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import type { Request, RequestHandler, Response } from "express";
import { sendError } from "../utils/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Canonical upload root: Backend/uploads
 * Works both in development (src/config) and production (dist/config).
 */
export const UPLOAD_ROOT = path.resolve(__dirname, "..", "..", "uploads");

export type UploadKind = "documents" | "images" | "products";

type UploadCategory = {
  directory: string;
  publicPath: string;
  maxFileSize: number;
  allowedMimeTypes: readonly string[];
};

export const UPLOAD_CATEGORIES: Record<UploadKind, UploadCategory> = {
  documents: {
    directory: path.join(UPLOAD_ROOT, "documents"),
    publicPath: "/uploads/documents",
    maxFileSize: 15 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ],
  },
  images: {
    directory: path.join(UPLOAD_ROOT, "image"),
    publicPath: "/uploads/image",
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ],
  },
  products: {
    directory: path.join(UPLOAD_ROOT, "products"),
    publicPath: "/uploads/products",
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ],
  },
};

const MIME_EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

// Ensure both upload directories exist before multer handles a request.
for (const category of Object.values(UPLOAD_CATEGORIES)) {
  fs.mkdirSync(category.directory, { recursive: true });
}

export type UploadedFileInfo = {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
};

export function buildPublicPath(kind: UploadKind, filename: string): string {
  return `${UPLOAD_CATEGORIES[kind].publicPath}/${filename}`;
}

export function buildPublicUrl(req: Request, publicPath: string): string {
  return `${req.protocol}://${req.get("host")}${publicPath}`;
}

export function describeUploadedFile(
  req: Request,
  file: Express.Multer.File,
  kind: UploadKind
): UploadedFileInfo {
  const publicPath = buildPublicPath(kind, file.filename);
  return {
    filename: file.filename,
    originalName: file.originalname,
    path: publicPath,
    url: buildPublicUrl(req, publicPath),
    size: file.size,
    mimetype: file.mimetype,
  };
}

export function computeSha256(filePath: string): string | null {
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  } catch (error) {
    console.warn("Could not compute SHA-256 checksum:", error);
    return null;
  }
}

/**
 * Deletes a stored upload safely. Only the basename is used, so values coming
 * from the database or request can never escape the upload directory.
 */
export function deleteStoredFile(
  kind: UploadKind,
  filePathOrUrl?: string | null
): void {
  if (!filePathOrUrl) return;

  const filename = path.basename(filePathOrUrl);
  if (!filename || filename === "." || filename === "..") return;

  const absolutePath = path.join(UPLOAD_CATEGORIES[kind].directory, filename);
  try {
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (error) {
    console.warn(`Could not delete uploaded file "${filename}":`, error);
  }
}

export function deleteRequestFiles(
  files: Express.Multer.File[] | undefined,
  kind: UploadKind
): void {
  for (const file of files ?? []) {
    deleteStoredFile(kind, file.path);
  }
}

/**
 * Multer trusts the multipart Content-Type header. Verify the first bytes of
 * the file as well so an HTML/script file cannot be renamed to .jpg/.pdf.
 */
const FILE_SIGNATURES: Record<string, (header: Buffer) => boolean> = {
  "application/pdf": (header) => header.subarray(0, 4).toString("ascii") === "%PDF",
  "image/jpeg": (header) =>
    header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
  "image/jpg": (header) =>
    header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
  "image/png": (header) =>
    header
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (header) =>
    header.subarray(0, 4).toString("ascii") === "RIFF" &&
    header.subarray(8, 12).toString("ascii") === "WEBP",
  "image/gif": (header) =>
    ["GIF87a", "GIF89a"].includes(header.subarray(0, 6).toString("ascii")),
  "image/avif": (header) =>
    header.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(header.subarray(8, 12).toString("ascii")),
};

/**
 * Returns a human readable error when the file content does not match the
 * declared MIME type, otherwise null. Invalid files are deleted immediately.
 */
export function validateUploadedFile(
  file: Express.Multer.File,
  kind: UploadKind
): string | null {
  const signatureCheck = FILE_SIGNATURES[file.mimetype];
  if (!signatureCheck) {
    deleteStoredFile(kind, file.path);
    return `Unsupported file type: ${file.mimetype}`;
  }

  try {
    const descriptor = fs.openSync(file.path, "r");
    try {
      const header = Buffer.alloc(16);
      fs.readSync(descriptor, header, 0, header.length, 0);
      if (!signatureCheck(header)) {
        deleteStoredFile(kind, file.path);
        return `File content does not match the declared type (${file.mimetype}).`;
      }
    } finally {
      fs.closeSync(descriptor);
    }
  } catch (error) {
    deleteStoredFile(kind, file.path);
    return error instanceof Error ? error.message : "Could not validate uploaded file.";
  }

  return null;
}

function createStorage(kind: UploadKind) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_CATEGORIES[kind].directory);
    },
    filename: (_req, file, cb) => {
      const extension = MIME_EXTENSIONS[file.mimetype] ?? "";
      const prefix = kind === "documents" ? "doc" : kind === "products" ? "prd" : "img";
      cb(null, `${prefix}-${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  });
}

function createUploader(kind: UploadKind) {
  const category = UPLOAD_CATEGORIES[kind];
  return multer({
    storage: createStorage(kind),
    limits: {
      fileSize: category.maxFileSize,
      files: 10,
    },
    fileFilter: (_req, file, cb) => {
      if (!category.allowedMimeTypes.includes(file.mimetype)) {
        cb(
          new Error(
            `Invalid file type "${file.mimetype}". Allowed: ${category.allowedMimeTypes.join(", ")}`
          )
        );
        return;
      }
      cb(null, true);
    },
  });
}

const documentUploader = createUploader("documents");
const imageUploader = createUploader("images");
const productImageUploader = createUploader("products");

/**
 * Multer errors normally reach the default Express error handler and produce
 * an HTML response. This wrapper keeps every upload error in the API envelope.
 */
function wrapUpload(middleware: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next) => {
    middleware(req, res, (error: unknown) => {
      if (!error) return next();

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return sendError(res, "Uploaded file is too large.", 413, "ERR_FILE_TOO_LARGE");
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return sendError(
            res,
            "Unexpected file field or too many files. Check the field name and count.",
            400,
            "ERR_UNEXPECTED_FILE"
          );
        }
        return sendError(res, error.message, 400, "ERR_UPLOAD");
      }

      const message = error instanceof Error ? error.message : "File upload failed";
      return sendError(res, message, 400, "ERR_UPLOAD");
    });
  };
}

export const uploadSingleDocument = wrapUpload(documentUploader.single("document"));
export const uploadSingleImage = wrapUpload(imageUploader.single("image"));
export const uploadMultipleImages = wrapUpload(imageUploader.array("images", 10));
export const uploadSingleProductImage = wrapUpload(productImageUploader.single("image"));
export const uploadMultipleProductImages = wrapUpload(productImageUploader.array("images", 10));
