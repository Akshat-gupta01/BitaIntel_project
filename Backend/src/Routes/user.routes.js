const express = require('express');
const { getUsersData, addUser, UpdateUser, deleteUser } = require('../Controllers/user.controller');
const {checkforAuth} = require('../middleware/authmiddleware');
const router = express.Router();


// this is admin routes for user only admin can access this

router.get('/users', getUsersData);
router.post('/add-user',checkforAuth, addUser);
router.patch('/update-user/:id',checkforAuth,UpdateUser);
router.delete('/delete-user/:id',checkforAuth,deleteUser);

module.exports = router;



module.exports = router;
