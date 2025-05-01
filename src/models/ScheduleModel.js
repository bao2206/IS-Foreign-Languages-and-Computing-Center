const mongoose = require('mongoose');
const {Schema} = mongoose;

const ScheduleSchema = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    room: {
        type: String, required: true
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
        enum: ["Scheduled", "Cancel", "make up lesson"],
        default: "Scheduled"
    },
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
