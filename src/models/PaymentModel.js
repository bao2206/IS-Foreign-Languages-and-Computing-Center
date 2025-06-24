const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentHistorySchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "payment_initiated",
      "payment_completed",
      "payment_failed",
      "payment_cancelled",
      "discount_applied",
    ],
  },
  by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: String,
  metadata: {
    type: Map,
    of: String,
    comment: "Additional information about the action",
  },
});

const PaymentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
      required: false,
    },
    parentName: {
      type: String,
      required: false,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    coursePrice: {
      type: String,
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    className: {
      type: String,
      required: true,
    },

    paymentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["VNPAY", "MOMO", "cash", "bank_transfer"],
      required: function () {
        return this.status !== "pending";
      },
    },
    contactStudent: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    history: [PaymentHistorySchema],
  },
  { timestamps: true }
);

// Add index for common queries
// PaymentSchema.index({ student: 1, createdAt: -1 });
// PaymentSchema.index({ course: 1 });
// PaymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
