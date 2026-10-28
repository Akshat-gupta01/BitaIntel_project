const { role: Role, permission: Permission } = require('../models');

function checkpermission(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ 
          message: 'Forbidden: No role assigned to user' 
        });
      }

      // 2. Super Admin has full access to all routes
      if (req.user.role.name === 'Super Admin') {
        return next();
      }

      // 3. Fetch permissions for user's role from database
      const roleWithPermissions = await Role.findByPk(req.user.role.id, {
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['name'],
          through: { attributes: [] }
        }]
      });

      if (!roleWithPermissions) {
        return res.status(403).json({ 
          message: 'Forbidden: Role not found' 
        });
      }

      const allowedPermissions = roleWithPermissions.permissions.map(p => p.name);

      // 4. Verify user has at least one of the required permissions
      const hasPermission = requiredPermissions.some(perm => 
        allowedPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Forbidden: You do not have permission (${requiredPermissions.join(', ')})` 
        });
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}


module.exports={checkpermission}