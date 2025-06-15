const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const teacherController = require("../controllers/TeacherController");
const certificateController = require("../controllers/CertificateController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const { asyncHandle } = require("../utils/asyncHandle");
//GET
router.get(
  "/",
  authMiddleware,
  checkPermission("create_user"),
  asyncHandle(userController.getAllUsers)
);
router.get("/staff", asyncHandle(userController.getUsersAreStaff));

// router.get('/', userController.getAllUsers);
// tạo nhân viên mới
router.post(
  "/create",
  authMiddleware,
  checkPermission("create_user"),
  asyncHandle(userController.createStaff)
);
// router.get("/register", authMiddleware, userController.getUsertoCreateAccount);
// router.post("/register", userController.registerAccount);
router.post("/login", asyncHandle(userController.loginAccount));
router.post(
  "/logout",
  authMiddleware,
  asyncHandle(userController.logoutAccount)
);
//update user
router.get(
  "/info/:id",
  authMiddleware,
  asyncHandle(userController.getUserInfo)
);
// cập nhật thông tin người dùng cá nhân
router.put(
  "/info/:id",
  authMiddleware,
  asyncHandle(userController.getUserUpdate)
);
router.put(
  "/change-password",
  authMiddleware,
  asyncHandle(userController.changePassword)
);
router.post("/forgot-password", asyncHandle(userController.forgotPassword));
router.put("/reset-password/:token", asyncHandle(userController.resetPassword));

router.put(
  "/update-role/",
  authMiddleware,
  checkPermission("update_user"),
  asyncHandle(userController.updateRole)
);
// phân quyền cho user
// Thêm quyền cho user
router.post(
  "/:id/permissions",
  asyncHandle(userController.addCustomPermissions)
);

// Lấy quyền của user
// router.get("/:id/permissions", userController.getCustomPermissions);

// // Set lại toàn bộ quyền cho user
// router.put("/:id/permissions", userController.setCustomPermissions);

// Xoá 1 quyền khỏi user
router.delete(
  "/:id/permissions/:permissionId",
  asyncHandle(userController.removeCustomPermission)
);

// manage teacher
router.get("/teachers", asyncHandle(teacherController.getAllTeachers));
router.get("/teachers/:id", asyncHandle(teacherController.getTeacherById));
router.put("/teachers/:id", asyncHandle(teacherController.updateTeacherById));

router.get(
  "/certificate/",
  asyncHandle(certificateController.getTeacherCertificate)
);
router.post(
  "/certificate/",
  asyncHandle(certificateController.createCertificate)
);
router.put(
  "/certificate/",
  asyncHandle(certificateController.updateCertificate)
);
router.delete(
  "/certificate/",
  asyncHandle(certificateController.deleteCertificate)
);

// Validate user fields
router.post("/validate-fields", asyncHandle(userController.validateUserFields));

module.exports = router;
