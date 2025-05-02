const express = require('express');
const router = express.Router();
const {asyncHandle} = require('../utils/asyncHandle');

const examController = require('../controllers/ExamController');

router.get('/',
    (req, res) => {
        res.send('Exam route is working!');
    }
);

// Define routes for exam operations

router.get("/get", asyncHandle(examController.getExams));
router.post("/create", asyncHandle(examController.createExam));
router.put("/update", asyncHandle(examController.updateExam));
router.delete("/delete", asyncHandle(examController.deleteExam));

module.exports = router;