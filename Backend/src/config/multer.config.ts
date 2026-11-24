import multer from "multer";
import path from "path";

// Allowed file types for product images
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Maximum file size: 5MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp_originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(
      null,
      `${uniqueSuffix}_${baseName}${ext.replace(".", "-")}`,
    );
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