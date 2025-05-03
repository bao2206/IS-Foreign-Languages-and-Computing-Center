const express = require('express');
const router = express.Router();
const courseController = require('../controllers/CourseController');
const {asyncHandle} = require('../utils/asyncHandle');

router.get('/',
    (req, res) => {
        res.send('Course route is working!');
    }
);

router.get("/get", asyncHandle(courseController.getCourse));
router.post("/create", asyncHandle(courseController.createCourse));
router.put("/update", asyncHandle(courseController.updateCourse));
router.delete("/delete", asyncHandle(courseController.deleteCourse));

// Registration methods
router.get("/registration", asyncHandle(courseController.getRegistratons));
router.post("/register", asyncHandle(courseController.registerForCourse));
router.put("/registration", asyncHandle(courseController.updateRegistration));


module.exports = router;

