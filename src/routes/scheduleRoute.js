const express = require("express");
const router = express.Router();
const { asyncHandle } = require("../utils/asyncHandle");
const authMiddleware = require("../middlewares/authMiddleware");
const scheduleController = require("../controllers/ScheduleController");

router.get("/", (req, res) => {
  res.send("Schedule route is working!");
});

// Define routes for schedule operations
// Get methods
router.post(
  "/get",
  authMiddleware,
  asyncHandle(scheduleController.getSchedules)
);
router.put(
  "/update",
  authMiddleware,
  asyncHandle(scheduleController.updateSchedule)
);
router.post(
  "/create",
  authMiddleware,
  asyncHandle(scheduleController.createSchedule)
);
router.delete(
  "/delete",
  authMiddleware,
  asyncHandle(scheduleController.deleteSchedule)
);

module.exports = router;
