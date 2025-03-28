const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: [true, "Please provide a student"]
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: "Class",
        required: [true, "Please provide a class"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: { type: String, enum: ["present", "late", "absent"], default: "present" }
})

module.exports = mongoose.model("Attendance", AttendanceSchema);