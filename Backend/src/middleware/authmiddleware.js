const jwt = require('jsonwebtoken');
const { User, role: Role } = require('../models');

async function checkforAuth(req, res, next) {

    const token =req.cookies.token;

    if (!token) return res.status(401).json({message:'Unauthorized'})

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        const user=await User.findByPk(decoded.id,{
            include:[{model: Role, as: 'role',attributes:['id','name']}] 
            })

        if(!user){
            return res.status(404).json({message:'User not found'})
        }

        req.user=user;
        next();


    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Unauthorized'});
    }
}

module.exports={checkforAuth}