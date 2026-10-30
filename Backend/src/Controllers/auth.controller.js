const { Op,where } = require('sequelize');
const { User, otp, role: Role, business_profiles } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { recordAuditLog } = require('../services/auditLogger.service');

async function register(req, res) {
    try {
        const { name, email, role, designation, phone, acceptance_of_terms, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Name, email, phone, and password are required' });
        }

        if (!acceptance_of_terms) {
            return res.status(400).json({ message: 'You must accept the terms and conditions to register' });
        }
        
        // Step 1: Sirf 'vendor' role allowed hai public registration ke liye
        const ALLOWED_ROLES = ['vendor'];
        const selectedRole = role || 'vendor';

        // Agar kisi ne 'Super Admin', 'Admin' etc. bheja toh turant block karo
        if (!ALLOWED_ROLES.includes(selectedRole)) {
            return res.status(403).json({ 
                message: 'Access denied: Cannot register with privileged role' 
            });
        }

        // Step 2: Database se 'vendor' role fetch karo
        const roleData = await Role.findOne({
            where: { name: 'vendor' }
        });

        if (!roleData) {
            return res.status(400).json({ message: 'Role not found' });
        }

        const existingUser = await User.findOne({
            where: { [Op.or]: [{ email }, { phone }] },
            include: [{
                model: Role,
                as: "role",
                attributes: ['id', 'name']
            }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? "email" : "phone";
            return res.status(400).json({ message: `${field} already exists`, field });
        }

        // Password ko hash karein before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const registerUser = await User.create({
            name,
            email,
            role_id: roleData.id,
            designation,
            phone,
            acceptance_of_terms,
            password: hashedPassword,
            status: 'pending'
        });

        const phoneOtp = "123456"; 
        const emailOtp = "654321"; 
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // Purane OTP delete karke naya save karein
        await otp.destroy({ where: { [Op.or]: [{ phone }, { email }] } });
        await otp.create({
            phone,
            email,
            phone_otp: phoneOtp,
            email_otp: emailOtp,
            expiresAt
        });

        return res.status(201).json({
            message: 'Registration initiated. OTPs sent to your mobile and email',
            user: {
                id: registerUser.id,
                name: registerUser.name,
                email: registerUser.email,
                phone: registerUser.phone,
                role: roleData.name,
                status: registerUser.status
            }
        });
    } catch (err) {
        console.error('Error in register:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function verifyotp(req, res) {                         
    try {
        const { phone, email, phone_otp, email_otp } = req.body;

        // Step 1: Input check - Phone ya Email me se koi ek aana chahiye
        if (!phone && !email) {
            return res.status(400).json({ message: 'Phone number or email is required' });
        }

        // Step 2: Database se User dhoondein (Phone se ya Email se)
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    phone ? { phone } : null,
                    email ? { email } : null
                ].filter(Boolean)
            },
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: business_profiles, as: 'business_profile', attributes: ['id', 'business_name', 'verification_status'] }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not registered with this phone or email' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        let validOtp = null;

        // Step 3: CASE 1 - Registration verification (dono Phone aur Email OTP chahiye)
        if (user.status === 'pending') {
            if (!email || !phone_otp || !email_otp) {
                return res.status(400).json({ 
                    message: 'Both phone and email OTP are required for registration verification' 
                });
            }

            validOtp = await otp.findOne({
                where: {
                    phone: user.phone,
                    email: user.email,
                    phone_otp,
                    email_otp,
                    expiresAt: { [Op.gt]: new Date() }
                }
            });
        } 
        // Step 3: CASE 2 - Login / Forgot Password verification (Email OTP ya Phone OTP me se jo bhi aaya ho)
        else {
            const checkConditions = [];

            if (email_otp) {
                checkConditions.push({ email: user.email, email_otp });
            }
            if (phone_otp) {
                checkConditions.push({ phone: user.phone, phone_otp });
            }

            if (checkConditions.length === 0) {
                return res.status(400).json({ message: 'OTP is required' });
            }

            validOtp = await otp.findOne({
                where: {
                    [Op.or]: checkConditions,
                    expiresAt: { [Op.gt]: new Date() }
                }
            });
        }

        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Step 4: OTP verify hone ke baad use database se delete karein
        await otp.destroy({
            where: {
                [Op.or]: [
                    { phone: user.phone },
                    { email: user.email }
                ]
            }
        });

        // Step 5: Agar registration pending tha toh status verified karein
        if (user.status === 'pending') {
            user.status = 'verified';
            await user.save();
        }

        // Step 6: JWT Token banayein (Login aur Password Reset dono ke liye kaam karega)
        const token = jwt.sign(
            { id: user.id, email: user.email, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Step 7: Response return karein
        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully.',
            token,
            resetToken: token,
            isProfileComplete: !!user.business_profile,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role ? user.role.name : null,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Error in verifyotp:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function loginPassword(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            where: { email },
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name']
                },
                {
                    model: business_profiles,
                    as: 'business_profile',
                    attributes: ['id', 'business_name', 'verification_status']
                }
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Step 1: Account status check
        if (user.status === 'suspended') {
            return res.status(403).json({
                message: 'Your account has been deactivated by admin'
            });
        }

        if (user.status === 'pending') {
            return res.status(403).json({
                message: 'Your account is not verified yet. Please complete OTP verification.',
                isPending: true
            });
        }

        // Step 2: Password check
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Step 3: JWT token generate
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role?.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Step 4: Token cookie mein save
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Step 5: Success response
        return res.status(200).json({
            success: true,
            message: 'Password login successful',
            token,
            isProfileComplete: !!user.business_profile,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role?.name,
                status: user.status
            }
        });

    } catch (err) {
        console.error('Error in loginPassword:', err);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function sendLoginOtp(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        const user = await User.findOne({ where: { phone } });
        if (!user) return res.status(404).json({ message: 'User not registered with this phone number' });

        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        const phoneOtp = "123456";
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await otp.destroy({ where: { phone } });
        await otp.create({ phone, phone_otp: phoneOtp, expiresAt });

        return res.status(200).json({ success: true, message: 'OTP sent to your phone' });
    } catch (err) {
        console.error('Error in sendLoginOtp:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getMe(req, res) {
    try {
        return res.status(200).json({
            message: 'User found successfully',
            user: req.user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function forgotpassword(req, res) {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email or phone number is required' 
            });
        }

        // 1. Agar email diya hai toh email se dhoondein, agar phone diya hai toh phone se
        const queryCondition = email ? { email } : { phone };
        const user = await User.findOne({ where: queryCondition });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: email 
                    ? 'User not registered with this email' 
                    : 'User not registered with this phone number' 
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false,
                message: 'Your account has been deactivated' 
            });
        }

        // 2. 6-digit OTP & 5 mins expiry
        const resetOtp = "654321"; 
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // 3. Purane OTP delete karein
        const deleteConditions = [];

        if (user.email) {
            deleteConditions.push({ email: user.email });
        }

        if (user.phone) {
            deleteConditions.push({ phone: user.phone });
        }

        if (deleteConditions.length > 0) {
            await otp.destroy({
                where: {
                    [Op.or]: deleteConditions
                }
            });
        }

        // 4. Agar email diya hai toh email_otp save karein, agar phone diya hai toh phone_otp save karein
        if (email) {
            await otp.create({
                email: user.email,
                phone: user.phone || '0000000000', // otp model mein phone required hai
                email_otp: resetOtp,
                phone_otp: null,
                expiresAt
            });

            return res.status(200).json({
                success: true,
                message: 'Password reset OTP has been sent to your registered email'
            });
        } else {
            await otp.create({
                phone: user.phone,
                email: user.email || null,
                phone_otp: resetOtp,
                email_otp: null,
                expiresAt
            });

            return res.status(200).json({
                success: true,
                message: 'Password reset OTP has been sent to your registered phone number'
            });
        }
    } catch (err) {
        console.error('Error in forgotpassword:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

async function resetPassword(req, res) {
    try {
        const { newPassword, confirmPassword } = req.body;

        // 1. Validations
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both newPassword and confirmPassword are required' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'newPassword and confirmPassword do not match' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // 2. req.user middleware se automatically mil gaya!
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        req.user.password = hashedPassword;
        await req.user.save();

        // 3. Purani cookie clear kar do
        res.clearCookie('token');

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. Please login with your new password.'
        });

    } catch (err) {
        console.error('Error in resetPassword:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

async function resendOtp(req, res) {
    try {
        const { email, phone } = req.body;

        // Step 1: Input Check
        if (!email && !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email or phone number is required' 
            });
        }

        // Step 2: User dhoondein
        const userQuery = [];
        if (email) userQuery.push({ email });
        if (phone) userQuery.push({ phone });

        const user = await User.findOne({ 
            where: { [Op.or]: userQuery } 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Step 3: Suspended account check
        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been deactivated' 
            });
        }

        // Step 4: Purana OTP delete karein
        await otp.destroy({ 
            where: { 
                [Op.or]: [
                    { phone: user.phone }, 
                    { email: user.email }
                ] 
            } 
        });

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // Step 5: CASE A - Registration Resend (Pending User -> Dono Phone & Email OTP)
        if (user.status === 'pending') {
            const phoneOtp = newOtp;
            const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

            await otp.create({
                phone: user.phone,
                email: user.email,
                phone_otp: phoneOtp,
                email_otp: emailOtp,
                expiresAt
            });

            return res.status(200).json({
                success: true,
                message: 'Registration OTPs have been resent to your mobile and email',
                phoneOtp,
                emailOtp
            });
        }

        // Step 5: CASE B - OTP Login Resend (Verified User -> Phone OTP)
        if (phone && !email) {
            await otp.create({
                phone: user.phone,
                email: user.email || null,
                phone_otp: newOtp,
                email_otp: null,
                expiresAt
            });

            return res.status(200).json({
                success: true,
                message: 'Login OTP has been resent to your phone',
                phoneOtp: newOtp
            });
        }

        // Step 5: CASE C - Email Resend (Forgot Password via Email)
        if (email && !phone) {
            await otp.create({
                phone: user.phone || '0000000000',
                email: user.email,
                phone_otp: null,
                email_otp: newOtp,
                expiresAt
            });

            return res.status(200).json({
                success: true,
                message: 'OTP has been resent to your email',
                emailOtp: newOtp
            });
        }

        // Fallback: Agar dono provide kiye hon
        await otp.create({
            phone: user.phone,
            email: user.email,
            phone_otp: newOtp,
            email_otp: newOtp,
            expiresAt
        });

        return res.status(200).json({
            success: true,
            message: 'OTP has been resent successfully',
            otp: newOtp
        });

    } catch (err) {
        console.error('Error in resendOtp:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

module.exports = { 
    register, 
    verifyotp, 
    loginPassword,
    sendLoginOtp, 
    logout, 
    getMe, 
    forgotpassword, 
    resetPassword ,
    resendOtp
};