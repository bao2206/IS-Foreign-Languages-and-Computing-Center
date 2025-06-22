const mongoose = require("mongoose");

const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    parentId:{
        type: Schema.Types.ObjectId, ref: 'Parent'
    },
    classId:[{
        type: Schema.Types.ObjectId, ref: 'Class'
    }],
    points: [{
        type: Schema.Types.ObjectId, ref: 'Point'
    }],
    attendance:[{
        type: Schema.Types.ObjectId, ref: 'Attendance'
    }]
});

module.exports = mongoose.model("Student", StudentSchema);