const express = require("express");
const router = express.Router();
const courseController = require("../controllers/CourseController");
const { asyncHandle } = require("../utils/asyncHandle");
const ClassController = require('../controllers/ClassController');

router.get("/", (req, res) => {
  res.send("Course route is working!");
});

router.get("/:id", asyncHandle(courseController.getCourseById));
router.post("/get", asyncHandle(courseController.getCourse));
router.post("/create", asyncHandle(courseController.createCourse));
router.put("/update", asyncHandle(courseController.updateCourse));
router.delete("/delete", asyncHandle(courseController.deleteCourse));

// Registration methods
router.get("/registration", asyncHandle(courseController.getRegistratons));
router.post("/register", asyncHandle(courseController.registerForCourse));
router.put("/registration", asyncHandle(courseController.updateRegistration));

router.get('/open/:courseId', ClassController.getOpenClassesByCourseId);

module.exports = router;
