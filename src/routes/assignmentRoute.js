const express = require("express");
const router = express.Router();

const AssignmentController = require("../controllers/AssignmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/checkPermission");
const { asyncHandle } = require("../utils/asyncHandle");
router.get("/", (req, res) => {
  res.send("Assignment route is working!");
});
router.post(
  "/create",
  authMiddleware,
  //   checkPermission("create_assignment"),
  asyncHandle(AssignmentController.createAssignment)
);
router.post("/get", authMiddleware, AssignmentController.getAssignments);
router.put(
  "/:id",
  authMiddleware,
  //   checkPermission("update_assignment"),
  asyncHandle(AssignmentController.updateAssignment)
);
router.delete(
  "/:id",
  authMiddleware,
  //   checkPermission("delete_assignment"),
  asyncHandle(AssignmentController.deleteAssignment)
);

// Trong assignmentRoutes.js
router.post(
  "/:id/submit",
  authMiddleware,
  //   checkPermission("submit_assignment"), // Thêm quyền nếu cần
  asyncHandle(AssignmentController.submissionAssignment)
);
module.exports = router;
