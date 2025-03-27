const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: [true, "Please provide a student"]
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Please provide a course"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: { type: String, enum: ["present", "late", "absent"], default: "present" }
})

module.exports = mongoose.model("Attendance", AttendanceSchema);