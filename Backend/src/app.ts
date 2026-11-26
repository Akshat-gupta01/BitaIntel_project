import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import masterRoutes from "./routes/master.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import rbacRoutes from "./routes/rbac.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import feedRoutes from "./routes/feed.routes.js";

const app = express();

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS Origins securely from Backend/.env
const envOrigins = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins: (string | RegExp)[] =
  envOrigins.length > 0
    ? envOrigins
    : ["http://localhost:3001", "http://127.0.0.1:3001"];

// In non-production mode, support local subnet IP patterns if needed
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/
  );
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Allow uploaded files to be embedded in iframes from frontend origin
app.use("/uploads", (req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  next();
});

// Static Uploads Folder — support Backend/uploads, cwd/uploads, and src/dist paths
const backendUploads = path.join(__dirname, "..", "uploads");
const rootUploads = path.join(process.cwd(), "uploads");
const backendCwdUploads = path.join(process.cwd(), "Backend", "uploads");
const backendDistUploads = path.resolve(__dirname, "..", "..", "uploads");

app.use("/uploads", express.static(backendUploads));
app.use("/uploads", express.static(rootUploads));
app.use("/uploads", express.static(backendCwdUploads));
app.use("/uploads", express.static(backendDistUploads));

// ─── Legacy exact-name fallbacks ────────────────────────────────────────────
// These only help resolve very old records that stored a filename without the
// upload sub-folder. They never serve a different file than the one requested:
// serving the "latest PDF/image" previously leaked other vendors' documents.
function decodeSafeFilename(rawValue: string): string {
  try {
    // Route params are already URL-decoded by Express; basename guarantees the
    // value cannot escape the uploads directory via "../" sequences.
    return path.basename(decodeURIComponent(rawValue || ""));
  } catch {
    return path.basename(rawValue || "");
  }
}

function findExactUpload(folder: string, filename: string): string | null {
  const normalizedHyphen = filename.replace(/\s+/g, "-");

  const possibleDirs = [
    path.join(backendUploads, folder),
    path.join(rootUploads, folder),
    path.join(backendCwdUploads, folder),
  ];

  for (const dir of possibleDirs) {
    for (const name of [filename, normalizedHyphen]) {
      if (!name) continue;
      const candidate = path.resolve(dir, name);
      if (path.dirname(candidate) !== path.resolve(dir)) continue;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
  }

  return null;
}

app.get("/uploads/documents/:filename", (req, res, next) => {
  const filename = decodeSafeFilename(req.params.filename);
  const filePath = filename ? findExactUpload("documents", filename) : null;

  if (!filePath) return next();

  const isPdf = filePath.toLowerCase().endsWith(".pdf");
  res.setHeader("Content-Type", isPdf ? "application/pdf" : "application/octet-stream");
  return res.sendFile(filePath);
});

app.get(["/uploads/image/:filename", "/uploads/products/:filename"], (req, res, next) => {
  const folder = req.path.startsWith("/uploads/products/") ? "products" : "image";
  const rawFilename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = decodeSafeFilename(rawFilename || "");
  const filePath = filename ? findExactUpload(folder, filename) : null;

  if (!filePath) return next();

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".png": "image/png",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
  };
  const mime = mimeMap[ext] || "image/jpeg";
  res.setHeader("Content-Type", mime);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.sendFile(filePath);
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/master", masterRoutes); 
app.use("/api/v1/admin", adminRoutes);   
app.use("/api/v1/rbac", rbacRoutes);   
export default app;
