import { Router } from "express";
import {
  register,
  login,
  loginWithOtp,
  resetPassword,
  logout,
  sendOtp,
  verifyOtp,
  getMe
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login-with-otp", loginWithOtp);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", getMe);

export default router;
