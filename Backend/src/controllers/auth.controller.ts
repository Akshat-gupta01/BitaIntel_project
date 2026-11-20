import { Request, Response } from "express";
import { Op } from "sequelize";
import { User, UserOTP, BusinessEntity } from "../models/index.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken, verifyToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  loginWithOtpSchema,
  resetPasswordSchema
} from "../Validations/auth.validation.js";
import { generateSlug, getInitials } from "../utils/slug.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// 4-digit numeric OTP generate karne ke liye
const generate4DigitOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export async function sendOtp(req: Request, res: Response) {
  const result = sendOtpSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, "Validation failed", 400, "ERR_VALIDATION", result.error.issues);
  }
  const { email, mobile, identifier, purpose } = result.data;
  const isDev = process.env.NODE_ENV !== "production";

  // 1. Agar purpose 'password_reset' ya 'login' hai -> user exist hona mandatory hai
  if (purpose === "password_reset" || purpose === "login") {
    const rawId = (identifier || email || mobile || "").trim();
    const isEmail = rawId.includes("@");
    const cleanDigits = rawId.replace(/\D/g, "");

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: rawId },
          { mobile: rawId },
          ...(cleanDigits.length >= 10
            ? [
                { mobile: cleanDigits },
                { mobile: cleanDigits.slice(-10) },
                { mobile: { [Op.like]: `%${cleanDigits.slice(-10)}%` } },
              ]
            : []),
        ],
      },
    });

    if (!user) {
      return sendError(
        res,
        "No registered account found with this corporate email or mobile number.",
        404,
        "ERR_USER_NOT_FOUND"
      );
    }

    const otpCode = generate4DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const targetVal = isEmail ? user.email : user.mobile;
    await UserOTP.create({
      targetType: isEmail ? "email" : "mobile",
      targetValue: targetVal,
      otpCode,
      purpose,
      expiresAt,
    });

    if (rawId !== targetVal) {
      await UserOTP.create({
        targetType: isEmail ? "email" : "mobile",
        targetValue: rawId,
        otpCode,
        purpose,
        expiresAt,
      });
    }

    if (isDev) {
      console.log(`[AUTH] ${purpose.toUpperCase()} OTP for ${rawId} (${user.email} / ${user.mobile}): ${otpCode}`);
    }

    return sendSuccess(res, {
      dispatched: true,
      channel: isEmail ? "email" : "mobile",
      target: targetVal,
      expiresInSeconds: 600,
      ...(isDev
        ? {
            mockOtpHint: {
              otp: otpCode,
              emailOtp: otpCode,
              mobileOtp: otpCode,
            },
          }
        : {}),
      message: `Security OTP sent to ${isEmail ? user.email : user.mobile} successfully.`,
    });
  }

  // 2. Agar purpose 'registration' hai -> check karein duplicate email aur dono channels par OTP bhejo
  if (purpose === "registration") {
    const existingUser = await User.findOne({ where: { email: email! } });
    if (existingUser) {
      return sendError(res, "An account with this email already exists", 409, "ERR_USER_EXISTS");
    }
  }

  const emailOtp = generate4DigitOtp();
  const mobileOtp = generate4DigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  if (email) {
    await UserOTP.create({
      targetType: "email",
      targetValue: email,
      otpCode: emailOtp,
      purpose,
      expiresAt,
    });
  }
  if (mobile) {
    await UserOTP.create({
      targetType: "mobile",
      targetValue: mobile,
      otpCode: mobileOtp,
      purpose,
      expiresAt,
    });
  }

  if (isDev) {
    console.log(`[AUTH] Registration OTP Email (${email}): ${emailOtp}`);
    console.log(`[AUTH] Registration OTP Mobile (${mobile}): ${mobileOtp}`);
  }

  return sendSuccess(res, {
    emailDispatched: !!email,
    mobileDispatched: !!mobile,
    expiresInSeconds: 600,
    ...(isDev
      ? {
          mockOtpHint: {
            emailOtp,
            mobileOtp,
          },
        }
      : {}),
    message: "Verification codes sent to email and mobile successfully.",
  });
}


export async function verifyOtp(req: Request, res: Response) {
  const result = verifyOtpSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, "Invalid OTP format", 400, "ERR_VALIDATION", result.error.issues);
  }
  const { email, emailOtp, mobile, mobileOtp, identifier, otp, purpose } = result.data;
  const now = new Date();

  // Single-channel values are used by login and password-reset flows.
  const singleId = (identifier || email || mobile || "").trim();
  const singleOtp = (otp || emailOtp || mobileOtp || "").trim();

  // Guard against the registration branch running with undefined targets,
  // which previously surfaced as a 500 from Sequelize instead of a 400.
  if (purpose === "registration") {
    if (!email || !emailOtp || !mobile || !mobileOtp) {
      return sendError(
        res,
        "Both email and mobile OTPs are required for registration verification",
        400,
        "ERR_VALIDATION"
      );
    }
  } else if (!singleId || !singleOtp) {
    return sendError(
      res,
      "Identifier and 4-digit OTP code are required",
      400,
      "ERR_VALIDATION"
    );
  }

  // Single-channel verification (purpose: password_reset ya login).
  // Registration MUST fall through to the dual-channel branch below, because
  // register() requires BOTH records to be consumed.
  if (purpose !== "registration") {
    const isDemoOtp = process.env.NODE_ENV !== "production" && singleOtp === "1234";
    const cleanDigits = singleId.replace(/\D/g, "");

    const otpRecord = await UserOTP.findOne({
      where: {
        targetValue: {
          [Op.in]: [singleId, cleanDigits].filter(Boolean),
        },
        otpCode: singleOtp,
        purpose,
        isConsumed: false,
        expiresAt: { [Op.gt]: now },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord && !isDemoOtp) {
      return sendError(res, "Invalid or expired OTP code", 400, "ERR_INVALID_OTP");
    }

    return sendSuccess(res, {
      verified: true,
      message: "Security code verified successfully.",
    });
  }

  // 1. Email OTP check karein (Registration dual verification)
  const isDev = process.env.NODE_ENV !== "production";
  const isDemoEmailOtp = isDev && (emailOtp === "1234" || emailOtp === "4921" || emailOtp === "8142");
  const isDemoMobileOtp = isDev && (mobileOtp === "1234" || mobileOtp === "4921" || mobileOtp === "8142");

  let emailRecord = await UserOTP.findOne({
    where: {
      targetType: "email",
      targetValue: email,
      otpCode: emailOtp,
      purpose,
      isConsumed: false,
      expiresAt: { [Op.gt]: now }
    }
  });

  if (!emailRecord && isDemoEmailOtp && email) {
    emailRecord = await UserOTP.create({
      targetType: "email",
      targetValue: email,
      otpCode: emailOtp!,
      purpose,
      isConsumed: true,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  }

  // 2. Mobile OTP check karein
  let mobileRecord = await UserOTP.findOne({
    where: {
      targetType: "mobile",
      targetValue: mobile,
      otpCode: mobileOtp,
      purpose,
      isConsumed: false,
      expiresAt: { [Op.gt]: now }
    }
  });

  if (!mobileRecord && isDemoMobileOtp && mobile) {
    mobileRecord = await UserOTP.create({
      targetType: "mobile",
      targetValue: mobile,
      otpCode: mobileOtp!,
      purpose,
      isConsumed: true,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  }

  if (!emailRecord || !mobileRecord) {
    return sendError(res, "Invalid or expired OTPs", 400, "ERR_INVALID_OTP");
  }

  // Dono OTPs ko consume (lock) kar dein
  if (!emailRecord.isConsumed) await emailRecord.update({ isConsumed: true });
  if (!mobileRecord.isConsumed) await mobileRecord.update({ isConsumed: true });

  return sendSuccess(res, {
    emailVerified: true,
    mobileVerified: true,
    message: "Both email and mobile verified successfully."
  });
}

export async function register(req: Request, res: Response) {
  try {
    // Step 1: Request body validate karein (Zod schema)
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, "Validation failed", 400, "ERR_VALIDATION", result.error.issues);
    }
    const { companyName, fullName, email, mobile, password, designation } = result.data;

    // Step 2: Check karein duplicate email toh nahi hai
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, "An account with this email already exists", 409, "ERR_USER_EXISTS");
    }

    // Step 3: OPTIMIZED SECURITY CHECK - Dono OTPs ko parallel (Promise.all) verify karein
    let [emailVerified, mobileVerified] = await Promise.all([
      UserOTP.findOne({
        where: { targetType: "email", targetValue: email, isConsumed: true, purpose: "registration" }
      }),
      UserOTP.findOne({
        where: { targetType: "mobile", targetValue: mobile, isConsumed: true, purpose: "registration" }
      })
    ]);

    if (!emailVerified || !mobileVerified) {
      if (process.env.NODE_ENV !== "production") {
        // In non-production/development mode, automatically record consumed OTPs so testing/registration is seamless
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        if (!emailVerified) {
          await UserOTP.create({
            targetType: "email",
            targetValue: email,
            otpCode: "4921",
            purpose: "registration",
            isConsumed: true,
            expiresAt,
          });
        }
        if (!mobileVerified) {
          await UserOTP.create({
            targetType: "mobile",
            targetValue: mobile,
            otpCode: "8142",
            purpose: "registration",
            isConsumed: true,
            expiresAt,
          });
        }
      } else {
        return sendError(
          res,
          "Please verify both Email and Mobile OTPs before registration",
          400,
          "ERR_OTP_VERIFICATION_REQUIRED"
        );
      }
    }

    // Step 4: Password hash karein (Bcrypt)
    const passwordHash = await hashPassword(password);

    // Step 5: Database me naya User banayein
    const newUser = await User.create({
      companyName,
      fullName,
      email,
      mobile,
      passwordHash,
      designation,
      role: "vendor",
      isEmailVerified: true,
      isMobileVerified: true,
      status: "ACTIVE"
    });

    // Step 6: ✨ Vendor ki Company Profile (BusinessEntity) automatically create karein
    const slug = generateSlug(companyName);
    const initials = getInitials(companyName);

    const newBusiness = await BusinessEntity.create({
      ownerUserId: newUser.id,          // 👈 Vendor ki User ID se link kiya (Foreign Key)
      name: companyName,
      legalName: companyName,
      slug,                             // 👈 Public profile URL (e.g. greenleaf-4821)
      initials,                         // 👈 Avatar initials (e.g. GL)
      score: 0.00,                      // 👈 Starting platform trust score (0.00 for newly registered)
      badge: "Under Review",            // 👈 Default badge
      verificationStatus: "registered", // 👈 Initial lifecycle status
      isPubliclyVisible: true
    });

    // Step 7: Single Auth Token generate karein aur HttpOnly Cookie me set karein
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });
    setAuthCookie(res, token);

    // Step 8: Clean JSON response return karein (User + Business dono ke sath)
    return sendSuccess(
      res,
      {
        message: "Vendor registered successfully",
        token,
        user: {
          id: newUser.id,
          companyName: newUser.companyName,
          fullName: newUser.fullName,
          email: newUser.email,
          mobile: newUser.mobile,
          role: newUser.role,
          designation: newUser.designation,
          business: {
            id: newBusiness.id,
            name: newBusiness.name,
            slug: newBusiness.slug,
            score: newBusiness.score,
            badge: newBusiness.badge,
            verificationStatus: newBusiness.verificationStatus
          }
        }
      },
      201
    );
  } catch (error) {
    console.error("Register Error:", error);
    return sendError(res, "Internal server error during registration", 500, "ERR_INTERNAL_SERVER");
  }
}

export async function login(req: Request, res: Response) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, "Invalid credentials format", 400, "ERR_VALIDATION", result.error.issues);
  }

  const { email, identifier, mobile, phone, password, otp, code, emailOtp, mobileOtp } = result.data;
  const rawIdentifier = (identifier || email || mobile || phone || "").trim();
  const rawOtp = (otp || code || emailOtp || mobileOtp)?.trim();

  // Agar user ne OTP provide kiya hai (bina password ke ya OTP method se), toh OTP flow se verify karein
  if (rawOtp && (!password || rawOtp.length >= 4)) {
    return handleOtpLogin(rawIdentifier, rawOtp, res);
  }

  // 1. User dhoondo: Corporate Email ya 10-digit Phone Number se
  const cleanDigits = rawIdentifier.replace(/\D/g, "");
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: rawIdentifier },
        { mobile: rawIdentifier },
        ...(cleanDigits.length >= 10
          ? [
              { mobile: cleanDigits },
              { mobile: cleanDigits.slice(-10) },
              { mobile: { [Op.like]: `%${cleanDigits.slice(-10)}%` } },
            ]
          : []),
      ],
    },
  });

  if (!user) {
    return sendError(res, "Invalid email/phone or password", 401, "ERR_INVALID_CREDENTIALS");
  }

  // 2. Password compare karein
  const isMatch = await comparePassword(password || "", user.passwordHash);
  if (!isMatch) {
    return sendError(res, "Invalid email/phone or password", 401, "ERR_INVALID_CREDENTIALS");
  }

  // 3. User ki Business Profile fetch karein
  const business = await BusinessEntity.findOne({ where: { ownerUserId: user.id } });

  // 4. JWT Token banayein (with role from database) aur Cookie me set karein
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  setAuthCookie(res, token);

  return sendSuccess(res, {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      companyName: user.companyName,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      designation: user.designation,
      business: business
        ? {
            id: business.id,
            name: business.name,
            legalName: business.legalName,
            slug: business.slug,
            score: business.score,
            badge: business.badge,
            verificationStatus: business.verificationStatus,
          }
        : null,
    },
  });
}

/**
 * Direct OTP Login Endpoint
 * POST /api/v1/auth/login-with-otp
 */
export async function loginWithOtp(req: Request, res: Response) {
  const result = loginWithOtpSchema.safeParse(req.body);
  if (!result.success) {
    return sendError(res, "Invalid OTP login parameters", 400, "ERR_VALIDATION", result.error.issues);
  }

  const { email, identifier, mobile, phone, otp } = result.data;
  const rawIdentifier = (identifier || email || mobile || phone || "").trim();
  return handleOtpLogin(rawIdentifier, otp.trim(), res);
}

/**
 * Shared Helper for OTP-based Authentication and Session Creation
 */
async function handleOtpLogin(rawIdentifier: string, otpCode: string, res: Response) {
  const cleanDigits = rawIdentifier.replace(/\D/g, "");

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: rawIdentifier },
        { mobile: rawIdentifier },
        ...(cleanDigits.length >= 10
          ? [
              { mobile: cleanDigits },
              { mobile: cleanDigits.slice(-10) },
              { mobile: { [Op.like]: `%${cleanDigits.slice(-10)}%` } },
            ]
          : []),
      ],
    },
  });

  if (!user) {
    return sendError(
      res,
      "No registered account found with this email or mobile number.",
      404,
      "ERR_USER_NOT_FOUND"
    );
  }

  const now = new Date();
  const isDemoOtp = process.env.NODE_ENV !== "production" && otpCode === "1234";

  const targets = [rawIdentifier, user.email, user.mobile, cleanDigits].filter(Boolean);
  const otpRecord = await UserOTP.findOne({
    where: {
      targetValue: { [Op.in]: targets },
      otpCode,
      purpose: "login",
      isConsumed: false,
      expiresAt: { [Op.gt]: now },
    },
    order: [["createdAt", "DESC"]],
  });

  if (!otpRecord && !isDemoOtp) {
    return sendError(res, "Invalid or expired verification code", 401, "ERR_INVALID_OTP");
  }

  if (otpRecord) {
    await otpRecord.update({ isConsumed: true });
  }

  const business = await BusinessEntity.findOne({ where: { ownerUserId: user.id } });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  setAuthCookie(res, token);

  return sendSuccess(res, {
    message: "Login successful via OTP",
    token,
    user: {
      id: user.id,
      companyName: user.companyName,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      designation: user.designation,
      business: business
        ? {
            id: business.id,
            name: business.name,
            legalName: business.legalName,
            slug: business.slug,
            score: business.score,
            badge: business.badge,
            verificationStatus: business.verificationStatus,
          }
        : null,
    },
  });
}

/**
 * Reset User Password
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, "Invalid reset password request", 400, "ERR_VALIDATION", result.error.issues);
    }

    const { identifier, email, mobile, otp, newPassword } = result.data;
    const rawIdentifier = (identifier || email || mobile || "").trim();
    const cleanDigits = rawIdentifier.replace(/\D/g, "");

    // 1. Find User by email or mobile
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: rawIdentifier },
          { mobile: rawIdentifier },
          ...(cleanDigits.length >= 10
            ? [
                { mobile: cleanDigits },
                { mobile: cleanDigits.slice(-10) },
                { mobile: { [Op.like]: `%${cleanDigits.slice(-10)}%` } },
              ]
            : []),
        ],
      },
    });

    if (!user) {
      return sendError(
        res,
        "No registered account found with this email or mobile number.",
        404,
        "ERR_USER_NOT_FOUND"
      );
    }

    // 2. Validate OTP from user_otps table
    const now = new Date();
    const isDemoOtp = process.env.NODE_ENV !== "production" && otp === "1234";

    const targets = [rawIdentifier, user.email, user.mobile, cleanDigits].filter(Boolean);
    const otpRecord = await UserOTP.findOne({
      where: {
        targetValue: { [Op.in]: targets },
        otpCode: otp,
        purpose: "password_reset",
        isConsumed: false,
        expiresAt: { [Op.gt]: now },
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord && !isDemoOtp) {
      return sendError(
        res,
        "Invalid or expired OTP code. Please request a new verification code.",
        401,
        "ERR_INVALID_OTP"
      );
    }

    // 3. Mark OTP as consumed
    if (otpRecord) {
      await otpRecord.update({ isConsumed: true });
    }

    // 4. Hash new password with bcrypt (SALT_ROUNDS = 12)
    const newPasswordHash = await hashPassword(newPassword);

    // 5. Update user passwordHash in database
    user.passwordHash = newPasswordHash;
    await user.save();

    console.log(`[AUTH] Password reset successfully for user ID ${user.id} (${user.email})`);

    return sendSuccess(res, {
      success: true,
      message: "Password has been successfully updated. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return sendError(res, "Internal server error while resetting password", 500, "ERR_INTERNAL_SERVER");
  }
}

export async function logout(req: Request, res: Response) {
  clearAuthCookie(res);
  return sendSuccess(res, { message: "Logged out successfully" });
}


export async function getMe(req: Request, res: Response) {
  try {
    // 1. Cookie se ya Authorization header se JWT token extract karein
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      // User logged-in nahi hai - 200 OK ke sath user: null return karein (Zero red console errors!)
      return sendSuccess(res, {
        isAuthenticated: false,
        user: null
      });
    }

    // 2. Token verify karein
    const decoded = verifyToken<{ userId: number }>(token);
    if (!decoded?.userId) {
      return sendSuccess(res, {
        isAuthenticated: false,
        user: null
      });
    }

    // 3. Database se user aur uski business entity fetch karein
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== "ACTIVE") {
      return sendSuccess(res, {
        isAuthenticated: false,
        user: null
      });
    }

    const business = await BusinessEntity.findOne({ where: { ownerUserId: user.id } });

    return sendSuccess(res, {
      isAuthenticated: true,
      token,
      user: {
        id: user.id,
        companyName: user.companyName,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        designation: user.designation,
        role: user.role,
        business: business
          ? {
              id: business.id,
              name: business.name,
              legalName: business.legalName,
              slug: business.slug,
              score: business.score,
              badge: business.badge,
              verificationStatus: business.verificationStatus
            }
          : null
      }
    });
  } catch (error) {
    console.error("Get me Error:", error);
    return sendError(res, "Internal server error", 500, "ERR_INTERNAL_SERVER");
  }
}
