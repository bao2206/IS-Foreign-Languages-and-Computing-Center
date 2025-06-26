const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User (có thể là Teacher hoặc Student tùy cấu hình)
      required: [true, "Teacher ID is required"],
      index: true, // Thêm index để tăng tốc truy vấn theo teacherId
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class", // Tham chiếu đến model Class
      required: [true, "Class ID is required"],
      index: true, // Thêm index để tăng tốc truy vấn theo classId
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true, // Loại bỏ khoảng trắng thừa
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true, // Loại bỏ khoảng trắng thừa
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (value) {
          return value > Date.now(); // Đảm bảo dueDate là tương lai
        },
        message: "Due date must be in the future",
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"], // Trạng thái của assignment
      default: "draft", // Mặc định là draft
    },
    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Student ID is required"],
          index: true,
        },
        submissionDate: {
          type: Date,
          default: Date.now,
        },
        link: {
          type: String,
          required: [true, "Link is required"],
          trim: true,
          maxlength: [1000, "Link cannot exceed 1000 characters"],
        },
        comments: {
          type: String,
          trim: true,
          maxlength: [2000, "Comments cannot exceed 2000 characters"],
        },
        teacherComments: {
          type: String,
          trim: true,
          maxlength: [2000, "Comments cannot exceed 2000 characters"],
        },
        grade: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Thêm index compound cho các truy vấn thường xuyên
assignmentSchema.index({ teacherId: 1, classId: 1, dueDate: -1 });

// Middleware để kiểm tra trùng lặp submission từ cùng một student
assignmentSchema.pre("save", async function (next) {
  const assignment = this;
  if (this.isModified("submissions")) {
    const studentIds = new Set(
      assignment.submissions.map((s) => s.studentId.toString())
    );
    if (studentIds.size !== assignment.submissions.length) {
      return next(
        new Error(
          "A student cannot submit multiple times for the same assignment."
        )
      );
    }
  }
  next();
});

module.exports = mongoose.model("Assignment", assignmentSchema);
