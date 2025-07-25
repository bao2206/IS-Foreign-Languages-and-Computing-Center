const express = require("express");
const router = express.Router();

// router.use("/",)

router.use("/users", require("./userRoute"));

router.use("/permission", require("./permissionRoute"));

router.use("/courses", require("./courseRoute"));
router.use("/classes", require("./classRoute"));
router.use("/schedules", require("./scheduleRoute"));
router.use("/exams", require("./examRoute"));
router.use("/discount", require("./discountRoute"));
router.use("/payment", require("./paymentRoute"));
router.use("/contact", require("./contactRoute"));
router.use("/upload", require("./uploadRoute"));
router.use("/role", require("./RoleRoute"));
router.use("/attendance", require("./attendanceRoute"));
router.use("/assignment", require("./assignmentRoute"));
module.exports = router;
