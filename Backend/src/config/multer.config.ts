import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Allowed file types for product images
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Maximum file size: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// ESM-compatible __dirname (project runs with `type: module`)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the same `Backend/uploads` root that app.ts serves statically.
// Works from both `src/config` (tsx) and `dist/config` (compiled).
const PRODUCT_UPLOAD_DIR = path.resolve(__dirname, "..", "..", "uploads", "products");
fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PRODUCT_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique filename while preserving the real extension so the
    // static handler serves the correct image/* content type.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .slice(0, 60);
    cb(null, `${uniqueSuffix}_${baseName || "product"}${ext}`);
  },
});

// File filter for image validation
const fileFilter = (req: any, file: any, cb: any) => {
  // Check file type
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WebP images are allowed"), false);
  }
};

// Check file size
const fileSizeLimit = (req: any, file: any, cb: any) => {
  file.size > MAX_FILE_SIZE
    ? cb(new Error("File size must be less than 5MB"))
    : cb(null, true);
};

export const productUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("productImage");

// Async wrapper for multer
export const productUploadAsync = (
  req: any,
  res: any,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    productUpload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return reject(err);
      } else if (err) {
        // An unknown error occurred when uploading.
        return reject(err);
      }
      resolve();
    });
  });
};

export default productUpload;