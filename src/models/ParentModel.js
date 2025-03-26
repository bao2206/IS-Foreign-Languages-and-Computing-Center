const mongoose  = require('mongoose');
const { Schema } = mongoose;

const ParentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
})
module.exports = mongoose.model("Parent", ParentSchema);