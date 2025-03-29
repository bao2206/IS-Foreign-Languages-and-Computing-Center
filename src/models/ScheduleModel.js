const mongoose = require('mongoose');
const {Schema} = mongoose.Schema;

const ScheduleSchema = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: String, required: true
    },
    date:{
        type: Date,
        required: true,
    },
    startTime:{
        type: String, 
        required: true,
    },
    endTime: {
        type: String, 
        required: true,
    },
    status:{
        type: String,
        enum: ["Scheduled", "Cancel"],
        default: "Scheduled"
    },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
