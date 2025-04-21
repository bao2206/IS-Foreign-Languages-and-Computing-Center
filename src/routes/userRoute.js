const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const teacherController = require('../controllers/TeacherController');
const certificateController = require('../controllers/CertificateController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const {asyncHandle} = require('../utils/asyncHandle');
router.get('/', authMiddleware ,asyncHandle(userController.getAllUsers));
router.post('/create', asyncHandle(userController.createStaff));
router.get('/register', authMiddleware,userController.getUsertoCreateAccount);
router.post('/register/:id', userController.registerAccount);
router.post('/login', asyncHandle(userController.loginAccount));
router.post("/logout", authMiddleware,asyncHandle(userController.logoutAccount));
//update user
router.get("/info/:id", authMiddleware ,asyncHandle(userController.getUserInfo));
// cập nhật thông tin người dùng cá nhân
router.post("/update/:id", authMiddleware ,asyncHandle(userController.getUserUpdate));

// manage teacher
router.get('/teachers', asyncHandle(teacherController.getAllTeachers));
router.get('/teachers/:id', asyncHandle(teacherController.getTeacherById));
router.put('/teachers/:id', asyncHandle(teacherController.updateTeacherById));

router.get('/teachers/certificate/:id', asyncHandle(certificateController.getTeacherCertificate));
router.post('/teachers/certificate/:id', asyncHandle(certificateController.createCertificate));
router.put('/teachers/certificate/:id', asyncHandle(certificateController.updateCertificate));
module.exports = router;