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
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
