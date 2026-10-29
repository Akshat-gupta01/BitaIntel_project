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
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

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

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        // User dhoondein
        const user = await User.findOne({
            where: { phone },
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: business_profiles, as: 'business_profile', attributes: ['id', 'business_name', 'verification_status'] }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not registered with this phone number' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        let validOtp = null;

        // CASE 1: Agar Registration pending hai -> Dono Phone & Email OTP verify hone chahiye
        if (user.status === 'pending') {
            if (!email || !phone_otp || !email_otp) {
                return res.status(400).json({ 
                    message: 'Both phone and email OTP are required for registration verification' 
                });
            }

            validOtp = await otp.findOne({
                where: {
                    phone,
                    email,
                    phone_otp,
                    email_otp,
                    expiresAt: { [Op.gt]: new Date() }
                }
            });
        } 
        // CASE 2: Agar User already verified hai aur Login kar raha hai -> Sirf Phone OTP
        else {
            if (!phone_otp) {
                return res.status(400).json({ message: 'Phone OTP is required for login' });
            }

            validOtp = await otp.findOne({
                where: {
                    phone,
                    phone_otp,
                    expiresAt: { [Op.gt]: new Date() }
                }
            });
        }

        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP delete karein
        await otp.destroy({ where: { phone } });

        // User dhoondein
        const user = await User.findOne({
            where: { phone },
            include: [
                { model: Role, as: 'role', attributes: ['id', 'name'] },
                { model: business_profiles, as: 'business_profile', attributes: ['id', 'business_name', 'verification_status'] }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not registered with this phone number' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Your account has been deactivated' });
        }

        // Status verified mark karein
        if (user.status === 'pending') {
            user.status = 'verified';
            await user.save();
        }

        // JWT Token generate karein
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully. Login successful.',
            token,
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

module.exports = { register, verifyotp, loginPassword, sendLoginOtp, logout, getMe };
