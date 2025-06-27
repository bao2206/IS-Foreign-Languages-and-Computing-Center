const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassSchema = new Schema({
  classname: {
    type: String,
    required: [true, "Please provide a classname"],
    unique: [true, "Please provide a unique classname"],
    trim: [true, "Name must not contain leading or trailing spaces"],
    min: 3,
    max: 10,
  },
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  teachers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  students: [
    {
      student: { type: Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending tuition payment", "enrolled", "paid"],
        default: "pending tuition payment",
      },
    },
  ],
  quantity: {
    type: Number,
    required: [true, "Please provide a quantity"],
    min: [1, "Quantity must be greater than 1"],
  },
  materials: [String],
  daybegin: {
    type: Date,
    required: [false, "Please provide a day begin"],
  },
  dayend: {
    type: Date,
    required: false,
    validate: {
      validator: function (v) {
        // Only validate if both daybegin and endDate are present
        if (this.daybegin && v) {
          return v > this.daybegin;
        }
        return true;
      },
      message: "End date must be after start date (daybegin)",
    },
  },
  status: {
    type: String,
    enum: ["Incomplete", "Complete"],
    default: "Incomplete",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attendance: [{ type: Schema.Types.ObjectId, ref: "Attendance" }],
});

module.exports = mongoose.model("Class", ClassSchema);
