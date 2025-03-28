const mongoose = require('mongoose');
const { Schema } = mongoose;

const PointSchema = new Schema({
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
    courseId:{
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Please provide a course"]
    },
    point:{
        type: Number,
        required: [true, "Please provide a point"],
        min: [0, "Point must be greater than 0"],
        max: [10, "Point must be less than 10"]
    }, 
    skill:{
        type: String,
        enum: ["reading", "writing", "speaking", "listening"],
        required: [true, "Please provide a skill"]
    }
});
module.exports = mongoose.model("Point", PointSchema);