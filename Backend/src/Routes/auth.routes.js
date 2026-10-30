const express = require('express');
const { 
    register, 
    verifyotp, 
    loginPassword, 
    sendLoginOtp, 
    logout, 
    getMe, 
    forgotpassword, 
    resetPassword,
    resendOtp
} = require('../Controllers/auth.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const router = express.Router();

router.post("/register", register);
router.post('/verify-otp', verifyotp);

router.post('/login-password', loginPassword);
router.post('/send-otp', sendLoginOtp);

router.post('/forgot-password', forgotpassword);
router.post('/reset-password', checkforAuth, resetPassword);

router.post('/resend-otp', resendOtp)


router.get("/logout", logout);
router.get("/me", checkforAuth, getMe);


module.exports = router;
