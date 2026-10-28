const { where } = require('sequelize');
const { Op } = require('sequelize');
const { User, otp, role: Role, business_profiles } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt"); 
const { recordAuditLog } = require('../services/auditLogger.service');

async function register(req, res) {
    try {
        const { name, email, role, designation, phone,acceptance_of_terms,password } = req.body;
        
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
            password: hashedPassword  // Hashed password save hoga
        });

        const token = jwt.sign({ id: registerUser.id, email: registerUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
        return res.status(201).json({
            message: 'User created successfully',
            user: registerUser,
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function verifyotp(req, res) {
    try {
        const { phone, otp: enteredOtp } = req.body;
        if (!phone || !enteredOtp) {
            return res.status(400).json({ message: 'Phone and OTP are required' });
        }

        const validOtp = await otp.findOne({
            where: {
                phone,
                otp: enteredOtp,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })
        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP verify ho gaya, use delete kar dein
        await otp.destroy({ where: { phone } });
        // User ki details aur business_profile status nikalein
        const user = await User.findOne({
            where: { phone },
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
            return res.status(404).json({ message: 'User not registered with this phone number' });
        }

        // JWT Token generate karein
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

        const isProfileComplete =!!user.business_profile;
        const verificationStatus = user.business_profile ? user.business_profile.verification_status : null;

        await recordAuditLog({
            userId: user.id,
            action: 'Login',
            detail: `${user.name || 'User'} signed in`,
            ipAddress: req.ip || req.headers['x-forwarded-for']
        });

        return res.status(200).json({
            message: 'Login successful',
            token,
            isProfileComplete,
            verification_status: verificationStatus,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role ? user.role.name : null,
                business_name: user.business_profile ? user.business_profile.business_name : null
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


async function login(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        const user = await User.findOne({ where: { phone } });
        if (!user) {
            return res.status(404).json({ message: 'User not registered. Please register first.' });
        }
        // const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const generatedOtp = "123456";
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5

        await otp.destroy({ where: { phone } });
        await otp.create({ phone, otp: generatedOtp, expiresAt });
        return res.status(200).json({
            message: 'OTP sent successfully',
        });

    } catch (err) {
        console.error(err);
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






module.exports = { register, verifyotp, login, logout, getMe };