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
  next();
});

// Static Uploads Folder — support both Backend/uploads and cwd/uploads
const backendUploads = path.join(__dirname, "..", "uploads");
const rootUploads = path.join(process.cwd(), "uploads");
const backendCwdUploads = path.join(process.cwd(), "Backend", "uploads");

app.use("/uploads", express.static(backendUploads));
app.use("/uploads", express.static(rootUploads));
app.use("/uploads", express.static(backendCwdUploads));

// Fallback document handler: if requested file isn't found by exact name, serve the closest or latest uploaded PDF
app.get("/uploads/documents/:filename", (req, res, next) => {
  const rawFilename = req.params.filename || "";
  const decodedFilename = decodeURIComponent(rawFilename);
  const normalizedHyphen = decodedFilename.replace(/\s+/g, "-");

  const possibleDirs = [
    path.join(backendUploads, "documents"),
    path.join(rootUploads, "documents"),
    path.join(backendCwdUploads, "documents"),
    path.resolve("uploads", "documents"),
    path.resolve("Backend", "uploads", "documents"),
  ];

  const candidateNames = [decodedFilename, normalizedHyphen, rawFilename];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      for (const name of candidateNames) {
        const exact = path.join(dir, name);
        if (fs.existsSync(exact) && fs.statSync(exact).isFile()) {
          const isPdf = name.toLowerCase().endsWith(".pdf");
          res.setHeader("Content-Type", isPdf ? "application/pdf" : "application/octet-stream");
          return res.sendFile(exact);
        }
      }
    }
  }

  // If exact file not found, serve latest available PDF from any uploads/documents
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      try {
        const pdfs = fs.readdirSync(dir).filter((f) => f.endsWith(".pdf"));
        if (pdfs.length > 0) {
          const latest = path.join(dir, pdfs[pdfs.length - 1]);
          res.setHeader("Content-Type", "application/pdf");
          return res.sendFile(latest);
        }
      } catch {}
    }
  }

  next();
});

// Fallback image handler for /uploads/image/:filename
app.get("/uploads/image/:filename", (req, res, next) => {
  const rawFilename = req.params.filename || "";
  const decodedFilename = decodeURIComponent(rawFilename);
  const normalizedHyphen = decodedFilename.replace(/\s+/g, "-");

  const possibleDirs = [
    path.join(backendUploads, "image"),
    path.join(rootUploads, "image"),
    path.join(backendCwdUploads, "image"),
    path.resolve("uploads", "image"),
    path.resolve("Backend", "uploads", "image"),
  ];

  const candidateNames = [decodedFilename, normalizedHyphen, rawFilename];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      for (const name of candidateNames) {
        const exact = path.join(dir, name);
        if (fs.existsSync(exact) && fs.statSync(exact).isFile()) {
          const ext = path.extname(name).toLowerCase();
          const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
          res.setHeader("Content-Type", mime);
          return res.sendFile(exact);
        }
      }
    }
  }

  // If exact image not found, serve latest available image
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      try {
        const images = fs.readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
        if (images.length > 0) {
          const latest = path.join(dir, images[images.length - 1]);
          res.setHeader("Content-Type", "image/jpeg");
          return res.sendFile(latest);
        }
      } catch {}
    }
  }

  next();
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/master", masterRoutes); 
app.use("/api/v1/admin", adminRoutes);   
app.use("/api/v1/rbac", rbacRoutes);   
export default app;
