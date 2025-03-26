const mongoose = require("mongoose");
const { Schema } = mongoose; 
const TeacherSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    documents: [String]
})
module.exports = mongoose.model("Teacher", TeacherSchema);