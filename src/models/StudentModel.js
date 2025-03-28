const mongoose = require("mongoose");

const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    parentId:{
        type: Schema.Types.ObjectId, ref: 'Parent', required: true
    },
    classId:{
        type: Schema.Types.ObjectId, ref: 'Class', required: true
    },
    points: [{
        type: Schema.Types.ObjectId, ref: 'Point', requuired: true
    }],
    attendance:[{
        type: Schema.Types.ObjectId, ref: 'Attendance', required: true
    }]
});

module.exports = mongoose.model("Student", StudentSchema);