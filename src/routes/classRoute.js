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
router.get("/classInf", asyncHandle(classController.getClassInformation));

// Post methods
router.post("/create", asyncHandle(classController.createClass));

// Put methods
router.put("/update", asyncHandle(classController.updateClass));
router.put("/removeStudent/:classId", asyncHandle(classController.removeStudentFromClass));

router.delete("/delete", asyncHandle(classController.deleteClass));


module.exports = router;