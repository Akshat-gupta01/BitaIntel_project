const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// 1. Business Documents Directory (PDF only)
const uploadDirectory = path.resolve(
  process.cwd(),
  "uploads",
  "business-documents"
);
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const filename = `${crypto.randomUUID()}.pdf`;
    callback(null, filename);
  },
});

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
    const error = new Error("Only PDF documents are allowed");
    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
});

// 2. Facility Media Directory (PDF, JPG, PNG, WEBP for plant photos & licenses)
const facilityUploadDir = path.resolve(
  process.cwd(),
  "uploads",
  "facility-documents"
);
fs.mkdirSync(facilityUploadDir, { recursive: true });

const facilityStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, facilityUploadDir);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;
    callback(null, filename);
  },
});

const facilityFileFilter = (req, file, callback) => {
  const allowedExts = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExts.includes(ext)) {
    const error = new Error("Allowed file formats: PDF, JPG, JPEG, PNG, WEBP");
    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

const uploadFacilityMedia = multer({
  storage: facilityStorage,
  fileFilter: facilityFileFilter,
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

module.exports = {
  uploadDocuments,
  uploadDirectory,
  uploadFacilityMedia,
  facilityUploadDir,
};
