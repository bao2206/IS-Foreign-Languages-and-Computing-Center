const mongoose = require('mongoose');
const {Schema} = mongoose.Schema;

const ExamSchema = new Schema({
    examName: {
        type: String, required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
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
    room: {
        type: String, required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
});

module.exports = mongoose.model('Exam', ExamSchema);