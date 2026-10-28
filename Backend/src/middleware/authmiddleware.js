const jwt = require('jsonwebtoken');
const { User, role: Role } = require('../models');

async function checkforAuth(req, res, next) {

    const token =req.cookies.token;

    if (!token) return res.status(401).json({message:'Unauthorized'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports={checkforAuth}