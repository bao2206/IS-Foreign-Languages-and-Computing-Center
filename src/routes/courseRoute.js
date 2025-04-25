const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');
const {asyncHandle} = require('../utils/asyncHandle');

router.get('/',
    (req, res) => {
        res.send('Course route is working!');
    }
);

router.get("/getAll", asyncHandle(courseController.getAllCourses));
router.get("/getSpecial", asyncHandle(courseController.getSpecialCourse));
router.get("/getById/:id", asyncHandle(courseController.getCourseById));
router.post("/create", asyncHandle(courseController.createCourse));
router.put("/update/:id", asyncHandle(courseController.updateCourse));
router.delete("/delete/:id", asyncHandle(courseController.deleteCourse));

// Registration methods
router.get("/registration", asyncHandle(courseController.getAllRegistrations));
router.get("/registration/:id", asyncHandle(courseController.getRegistrationById));
router.get("/registration/user/:id", asyncHandle(courseController.getRegistrationByUserId));
router.post("/register", asyncHandle(courseController.registerForCourse));
router.put("/registration/:id", asyncHandle(courseController.changeStatusRegistration));
router.put("/registration/respond/:id", asyncHandle(courseController.respondToRegistration));

module.exports = router;

