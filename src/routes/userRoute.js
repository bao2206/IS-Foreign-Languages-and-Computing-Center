const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');
const {asyncHandle} = require('../utils/asyncHandle');
router.get('/',  userController.getAllUsers);
router.post('/create', userController.createUser);
router.get('/register', authMiddleware,userController.getUsertoCreateAccount);
router.post('/register/:id', userController.registerAccount);
router.post('/login', asyncHandle(userController.loginAccount));
router.post("/logout", authMiddleware,asyncHandle(userController.logoutAccount));
// cập nhật thông tin người dùng cá nhân
router.post("/update/:id", authMiddleware ,asyncHandle(userController.getUserUpdate));
module.exports = router;