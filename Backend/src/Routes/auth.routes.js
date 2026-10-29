const express=require('express');
const {register,verifyotp,loginPassword,sendLoginOtp,logout,getMe} = require('../Controllers/auth.controller');
const {checkforAuth} = require('../middleware/authmiddleware');
const router=express.Router();

router.post("/register",register);
router.post('/verify-otp',verifyotp);

router.post('/login-password', loginPassword);
router.post('/send-otp', sendLoginOtp);

router.get("/logout",logout);
router.get("/me",checkforAuth, getMe);

module.exports = router;