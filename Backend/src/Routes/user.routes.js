const express = require('express');
const { getUsersData, addUser, UpdateUser, deleteUser } = require('../Controllers/user.controller');
const { checkforAuth } = require('../middleware/authmiddleware');
const { checkpermission } = require('../middleware/permissionmiddleware');

const router = express.Router();

// Admin routes for user management
router.get('/users', checkforAuth, checkpermission('view_user'), getUsersData);
router.post('/add-user', checkforAuth, checkpermission('create_user'), addUser);
router.patch('/update-user/:id', checkforAuth, checkpermission('update_user'), UpdateUser);
router.delete('/delete-user/:id', checkforAuth, checkpermission('delete_user'), deleteUser);

module.exports = router;
