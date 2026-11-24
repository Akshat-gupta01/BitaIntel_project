import { z } from "zod";

// 1. Send OTP ke liye validation
export const sendOtpSchema = z.object({
  email: z.string().optional(),
  mobile: z.string().optional(),
  identifier: z.string().optional(),
  companyName: z.string().optional(),
  purpose: z.enum(["registration", "login", "password_reset"]).default("registration")
}).refine(
  (data) => {
    if (data.purpose === "registration") {
      const hasValidEmail = typeof data.email === "string" && data.email.includes("@");
      const cleanMobile = data.mobile?.replace(/\D/g, "") || "";
      const hasValidMobile = typeof data.mobile === "string" && cleanMobile.length >= 10;
      return hasValidEmail && hasValidMobile;
    }
    const id = data.identifier || data.email || data.mobile;
    return typeof id === "string" && id.trim().length > 0;
  },
  {
    message: "A valid corporate email or 10-digit mobile number is required to dispatch OTP."
  }
);

// 2. Verify OTP ke liye validation
export const verifyOtpSchema = z.object({
  email: z.string().optional(),
  emailOtp: z.string().optional(),
  mobile: z.string().optional(),
  mobileOtp: z.string().optional(),
  identifier: z.string().optional(),
  otp: z.string().optional(),
  purpose: z.enum(["registration", "login", "password_reset"]).default("registration")
});

// 3. Complete Registration ke liye validation
export const registerSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  mobile: z.string().min(10, "Valid mobile number required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  designation: z.string().default("Director / Authorized Signatory")
});

// 4. Login ke liye validation
export const loginSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  otp: z.string().optional(),
  code: z.string().optional(),
  emailOtp: z.string().optional(),
  mobileOtp: z.string().optional(),
  purpose: z.enum(["registration", "login", "password_reset"]).optional()
}).refine(
  (data) => {
    const id = (data.email || data.identifier || data.mobile || data.phone || "").trim();
    return id.length > 0;
  },
  { message: "Please provide a registered corporate email or 10-digit mobile number" }
).refine(
  (data) => {
    const pass = data.password?.trim();
    const otp = (data.otp || data.code || data.emailOtp || data.mobileOtp)?.trim();
    return (pass && pass.length > 0) || (otp && otp.length >= 4);
  },
  { message: "Either password or 4-digit OTP is required for authentication" }
);

// 5. Direct Login via OTP Validation
export const loginWithOtpSchema = z.object({
  email: z.string().optional(),
  identifier: z.string().optional(),
  mobile: z.string().optional(),
  phone: z.string().optional(),
  otp: z.string().min(4, "OTP must be at least 4 digits")
}).refine(
  (data) => {
    const id = (data.email || data.identifier || data.mobile || data.phone || "").trim();
    return id.length > 0;
  },
  { message: "Please provide a registered corporate email or mobile number" }
);

// 6. Reset Password Validation
export const resetPasswordSchema = z.object({
  email: z.string().optional(),
  mobile: z.string().optional(),
  identifier: z.string().optional(),
  otp: z.string().min(4, "OTP code must be at least 4 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
}).refine(
  (data) => {
    const id = (data.identifier || data.email || data.mobile || "").trim();
    return id.length > 0;
  },
  { message: "Please provide your registered corporate email or mobile number" }
);
