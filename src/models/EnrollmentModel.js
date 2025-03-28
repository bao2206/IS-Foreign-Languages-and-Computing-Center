const mongoose = require('mongoose');
const { Schema } = mongoose;


const EnrollmentSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: [true, "Please provide a student"]
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Please provide a course"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: { type: String, enum: ["enrolled", "completed", "dropped"], default: "enrolled" },
    consultant: {
        type: String,
    }
});
module.exports = mongoose.model("Enrollment", EnrollmentSchema);