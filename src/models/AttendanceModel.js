const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Tham chiếu đến model Teacher, có thể thay đổi tùy model của bạn
  },
  students: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Tham chiếu đến model Student, có thể thay đổi tùy model của bạn
        required: true,
      },
      status: {
        type: String,
        enum: ["present", "absent", "late"], // Trạng thái điểm danh
        default: "present",
      },
    },
  ],
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // Tham chiếu đến model Class, có thể thay đổi tùy model của bạn
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
