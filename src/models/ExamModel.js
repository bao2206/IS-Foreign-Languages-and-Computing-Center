
const mongoose = require('mongoose');
const {Schema} = mongoose;

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
        type: String, 
        default: "Waiting for update",
        required: false
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],
});

module.exports = mongoose.model('Exam', ExamSchema);