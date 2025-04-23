const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseRegistrationSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [false, "Please provide the employee's user ID"],
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please provide the student's user ID"],
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course', 
    required: [true, "Please provide the course ID"],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CourseRegistration', CourseRegistrationSchema);
