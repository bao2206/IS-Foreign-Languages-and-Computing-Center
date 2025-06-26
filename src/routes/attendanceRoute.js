const express = require("express");
const router = express.Router();

const AttendanceController = require("../controllers/AttendanceController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const { asyncHandle } = require("../utils/asyncHandle");
const { route } = require("./userRoute");

router.get("/", (req, res) => {
  res.send("Attendance route is working!");
});

router.post(
  "/create",
  authMiddleware,
  asyncHandle(AttendanceController.createAttendance)
);

router.post(
  "/class",
  authMiddleware,
  asyncHandle(AttendanceController.getAttendanceByClassIdAndDate)
);

router.get(
  "/:id",
  authMiddleware,
  asyncHandle(AttendanceController.getAttendanceById)
);

router.get(
  "/student/:studentId",
  authMiddleware,
  asyncHandle(AttendanceController.getAttendanceByStudentId)
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandle(AttendanceController.updateAttendance)
);

module.exports = router;
