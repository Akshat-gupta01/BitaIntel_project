const { User, role: Role } = require('../models');
const { Op } = require('sequelize');

async function getUsersData(req, res) {
    try {
        const allusers = await User.findAll({
            attributes: ['id', 'name', 'email', 'phone', 'role_id', 'status'],
            include: [
                {
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!allusers || allusers.length === 0) {
            return res.status(404).json({
                message: 'No users data found'
            });
        }

      

        return res.status(200).json({
            message: 'Users data fetched successfully',
            data: allusers
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function addUser(req, res) {
    try {
        // Step 1: Get data from frontend / Postman
        const { name, email, phone, role, status } = req.body;

        // Step 2: Check required fields
        if (!name || !email || !phone || !role) {
            return res.status(400).json({
                message: 'Name, email, phone, and role are required'
            });
        }

        // Step 3: Find role in Role table
        const roleData = await Role.findOne({
            where: {
                name: role
            }
        });

        // Step 4: Check whether role exists
        if (!roleData) {
            return res.status(400).json({
                message: 'Invalid role. Role does not exist'
            });
        }

        // Step 5: Check duplicate phone number
        const existingPhone = await User.findOne({
            where: {
                phone: phone
            }
        });

        if (existingPhone) {
            return res.status(400).json({
                message: 'User with this phone number already exists'
            });
        }

        // Step 6: Check duplicate email
        const existingEmail = await User.findOne({
            where: {
                email: email
            }
        });

        if (existingEmail) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        // Step 7: Create new user
        const user = await User.create({
            name: name,
            email: email,
            phone: phone,
            role_id: roleData.id,
            status: status || 'pending'
        });

        // Step 8: Send success response
        return res.status(201).json({
            message: 'User added successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: roleData.name,
                status: user.status
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


async function UpdateUser(req, res) {
    try {
        const id = req.params.id;
        const user = await User.findOne({
            where: { id: id },
            include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const { name, email, phone, role, status } = req.body;

        // If role is provided, validate it
        let roleName = user.role ? user.role.name : null;
        if (role) {
            const roleData = await Role.findOne({
                where: { name: role }
            });
            if (!roleData) {
                return res.status(400).json({
                    message: 'Invalid role. Role does not exist'
                });
            }
            user.role_id = roleData.id;
            roleName = roleData.name;
        }

        // Check duplicate phone number if changing phone
        if (phone && phone !== user.phone) {
            const existingPhone = await User.findOne({
                where: {
                    phone: phone,
                    id: { [Op.ne]: id }
                }
            });
            if (existingPhone) {
                return res.status(400).json({
                    message: 'User with this phone number already exists'
                });
            }
            user.phone = phone;
        }

        // Check duplicate email if changing email
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({
                where: {
                    email: email,
                    id: { [Op.ne]: id }
                }
            });
            if (existingEmail) {
                return res.status(400).json({
                    message: 'User with this email already exists'
                });
            }
            user.email = email;
        }

        if (name !== undefined) user.name = name;
        if (status !== undefined) user.status = status;

        await user.save();

        return res.status(200).json({
            message: 'User updated successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: roleName,
                status: user.status
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

async function deleteUser(req, res) {
    try {
        const id = req.params.id;   
           if (req.user.id == id) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            });
        }
        const user = await User.findOne({
            where: {
                id: id
            }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        await user.destroy();
        return res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = { getUsersData, addUser, deleteUser, UpdateUser };