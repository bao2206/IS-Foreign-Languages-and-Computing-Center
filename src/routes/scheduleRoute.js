const express = require('express');
const router = express.Router();
const {asyncHandle} = require('../utils/asyncHandle');

const scheduleController = require('../controllers/ScheduleController');

router.get('/',
    (req, res) => {
        res.send('Schedule route is working!');
    }
);

// Define routes for schedule operations
// Get methods
router.get("/get", asyncHandle(scheduleController.getSchedules));
router.put("/update", asyncHandle(scheduleController.updateSchedule));
router.post("/create", asyncHandle(scheduleController.createSchedule));
router.delete("/delete", asyncHandle(scheduleController.deleteSchedule));

module.exports = router;