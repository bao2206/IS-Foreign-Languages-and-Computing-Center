const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSchema = new Schema({
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
    skill:{
        type: String,
        enum: ["reading", "writing", "math", "science"],
        required: [true, "Please provide a skill"]
    }
});
module.exports = mongoose.model("Grade", GradeSchema);