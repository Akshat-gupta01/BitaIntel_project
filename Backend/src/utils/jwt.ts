import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

const envSecret = process.env.JWT_SECRET?.trim();

if (!envSecret && process.env.NODE_ENV === "production") {
  // A predictable fallback secret in production would let anyone forge tokens.
  throw new Error("JWT_SECRET must be configured before the server starts in production.");
}

if (!envSecret) {
  console.warn(
    "[SECURITY] JWT_SECRET is not set. Using an insecure development-only fallback. Configure JWT_SECRET in Backend/.env."
  );
}

const JWT_SECRET: Secret = envSecret || "bitaintel_dev_only_fallback_secret";

// 1. Cookie Configuration (24 hours)
export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000 // 24 hours in ms
};

// 2. Generate Single Token for Cookie
export function generateToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "1d"
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
}

// 3. Helper to set cookie in Response
export function setAuthCookie(res: Response, token: string): void {
  res.cookie("token", token, cookieOptions);
}

// 4. Helper to clear cookie on Logout
export function clearAuthCookie(res: Response): void {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

// 5. Verify & Decode Token
export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}
