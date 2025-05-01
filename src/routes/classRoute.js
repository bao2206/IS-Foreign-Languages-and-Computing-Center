const express = require('express');
const router = express.Router();
const {asyncHandle} = require('../utils/asyncHandle');

const classController = require('../controllers/ClassController');

router.get('/',
    (req, res) => {
        res.send('Class route is working!');
    }
);

// Define routes for class operations
// Get methods
router.get("/getAll", asyncHandle(classController.getAllClasses));
router.get("/getById/", asyncHandle(classController.getClassById));

// Post methods
router.post("/create", asyncHandle(classController.createClass));

// Put methods
router.put("/update", asyncHandle(classController.updateClass));
router.put("/addTeacher", asyncHandle(classController.addTeacherToClass));
router.put("/addStudent", asyncHandle(classController.addStudentToClass));
router.put("/removeStudent/:classId", asyncHandle(classController.removeStudentFromClass));


module.exports = router;