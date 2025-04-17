const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const {asyncHandle} = require('../utils/asyncHandle');
// const checkPermission = require('../middlewares/checkPermission');
router.get('/', authMiddleware ,asyncHandle(PermissionController.getAllPermission));
router.post('/create', authMiddleware ,PermissionController.createPermission);
// router.get('/register', authMiddleware,PermissionController.getUsertoCreateAccount);
// router.post('/register/:id', PermissionController.registerAccount);
// router.post('/login', asyncHandle(PermissionController.loginAccount));
// router.post("/logout", authMiddleware,asyncHandle(PermissionController.logoutAccount));
// cập nhật thông tin người dùng cá nhân
// router.post("/update/:id", authMiddleware ,asyncHandle(PermissionController.getUserUpdate));
module.exports = router;