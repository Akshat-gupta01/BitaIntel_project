import api from "../utils/axios";

// ─── Payload Interfaces ─────────────────────────────────────────────────────

export interface SendOtpPayload {
  email?: string;
  mobile?: string;
  identifier?: string;
  companyName?: string;
  purpose?: "registration" | "login" | "password_reset";
  [key: string]: unknown;
}

export interface VerifyOtpPayload {
  email?: string;
  emailOtp?: string;
  mobile?: string;
  mobileOtp?: string;
  identifier?: string;
  otp?: string;
  purpose?: "registration" | "login" | "password_reset";
  [key: string]: unknown;
}

export interface RegisterPayload {
  companyName: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  designation?: string;
  role?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email?: string;
  identifier?: string;
  mobile?: string;
  phone?: string;
  password?: string;
  role?: "vendor" | "admin" | "super_admin" | "verification_officer" | "buyer" | string;
  emailOtp?: string;
  mobileOtp?: string;
  otp?: string;
  purpose?: "registration" | "login" | "password_reset";
  [key: string]: unknown;
}

export interface ResetPasswordPayload {
  identifier?: string;
  email?: string;
  mobile?: string;
  otp: string;
  newPassword: string;
  [key: string]: unknown;
}

// ─── Response Interfaces ────────────────────────────────────────────────────

export interface UserBusinessInfo {
  id: number;
  name: string;
  legalName?: string;
  tradeName?: string;
  verificationStatus?: string;
  score?: number;
  level?: number;
  badge?: string;
  verified?: boolean;
  [key: string]: unknown;
}

export interface AuthUserEntity {
  id: number;
  companyName: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: string;
  designation?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  status?: string;
  business?: UserBusinessInfo | null;
  [key: string]: unknown;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: AuthUserEntity;
  business?: UserBusinessInfo;
  data?: {
    message?: string;
    token?: string;
    user?: AuthUserEntity;
    business?: UserBusinessInfo;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OtpResponse {
  success?: boolean;
  message?: string;
  data?: {
    message?: string;
    mockOtpHint?: {
      emailOtp: string;
      mobileOtp: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface MeResponse {
  success?: boolean;
  isAuthenticated?: boolean;
  token?: string;
  user?: AuthUserEntity | null;
  data?: {
    isAuthenticated?: boolean;
    token?: string;
    user?: AuthUserEntity | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─── API Methods ────────────────────────────────────────────────────────────

/**
 * 1. Send OTP to Email and Mobile via Backend
 * POST http://localhost:3000/api/v1/auth/send-otp
 */
export const sendOtp = async (data: SendOtpPayload): Promise<OtpResponse> => {
  const payload: SendOtpPayload = {
    ...data,
    purpose: data.purpose || "registration",
  };
  const res = await api.post("/auth/send-otp", payload);
  return res.data;
};

/**
 * 2. Verify OTP for Email and Mobile
 * POST http://localhost:3000/api/v1/auth/verify-otp
 */
export const verifyOtp = async (data: VerifyOtpPayload): Promise<OtpResponse> => {
  const payload: VerifyOtpPayload = {
    ...data,
    purpose: data.purpose || "registration",
  };
  const res = await api.post("/auth/verify-otp", payload);
  return res.data;
};

export const verify = verifyOtp;

/**
 * 3. Register Vendor User & Auto-Create Linked Business Entity
 * POST http://localhost:3000/api/v1/auth/register
 */
export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

/**
 * 4. Authenticate User & Receive Session Token / HttpOnly Cookie
 * Supports login via email or mobile/identifier, with role and OTP capability
 * POST http://localhost:3000/api/v1/auth/login
 */
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  // Normalize credentials: ensure email is populated if identifier or mobile was passed
  const normalizedEmail = (credentials.email || credentials.identifier || credentials.mobile || "").trim();
  const payload: Record<string, unknown> = {
    ...credentials,
    email: normalizedEmail,
  };

  const res = await api.post("/auth/login", payload);
  return res.data;
};

export interface LoginWithOtpPayload {
  identifier: string;
  otp: string;
  email?: string;
  mobile?: string;
  [key: string]: unknown;
}

/**
 * 4b. Authenticate via Verified OTP & Receive Session Token / HttpOnly Cookie
 * POST http://localhost:3000/api/v1/auth/login-with-otp
 */
export const loginWithOtp = async (data: LoginWithOtpPayload): Promise<AuthResponse> => {
  const payload: LoginWithOtpPayload = {
    ...data,
    identifier: data.identifier.trim(),
    otp: data.otp.trim(),
  };
  const res = await api.post("/auth/login-with-otp", payload);
  return res.data;
};

/**
 * 5. Log Out & Clear Session Cookie
 * POST http://localhost:3000/api/v1/auth/logout
 */
export const logout = async (): Promise<{ success?: boolean; message?: string }> => {
  const res = await api.post("/auth/logout");
  return res.data;
};

/**
 * 6. Get Current Authenticated User (Session Persistence Check)
 * GET http://localhost:3000/api/v1/auth/me
 */
export const getMe = async (): Promise<MeResponse> => {
  const res = await api.get("/auth/me");
  return res.data;
};

/**
 * 7. Reset Password via Verified OTP
 * POST http://localhost:3000/api/v1/auth/reset-password
 */
export const resetPassword = async (
  data: ResetPasswordPayload
): Promise<{
  success?: boolean;
  message?: string;
  data?: { success?: boolean; message?: string };
}> => {
  const normalizedId = (data.identifier || data.email || data.mobile || "").trim();
  const payload = {
    ...data,
    identifier: normalizedId,
    email: normalizedId,
  };
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
};
