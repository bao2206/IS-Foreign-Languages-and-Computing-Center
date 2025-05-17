const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        comment: "ID of user making the payment (can be parent or student)" 
    },
    studentId: { 
        type: Schema.Types.ObjectId, 
        ref: "Student", 
        required: true,
        comment: "ID of student the payment is for" 
    },
    courseId: { 
        type: Schema.Types.ObjectId, 
        ref: "Course", 
        required: true 
    },
    coursePrice: { 
        type: Number, 
        required: true,
        min: [0, "Course price cannot be negative"],
        comment: "Original course price"
    },
    finalAmount: { 
        type: Number,
        required: true,
        min: [0, "Final amount cannot be negative"],
        comment: "Price after applying discount"
    },
    amount: { 
        type: Number, 
        required: true,
        min: [0, "Amount cannot be negative"],
        comment: "Actual amount paid"
    },
    method: { 
        type: String, 
        enum: ["VNPAY", "MOMO", "cash"],
        required: true
    },
    status: { 
        type: String, 
        enum: ["pending", "completed", "failed", "cancelled"],
        default: "pending" 
    },
    discount_code: { 
        type: Schema.Types.ObjectId, 
        ref: "Discount",
        required: false
    },
    term: { 
        type: String,
        required: true,
        comment: "Academic term for the payment"
    },
    paymentDate: {
        type: Date,
        comment: "Date when payment was completed"
    },
    transactionId: {
        type: String,
        sparse: true,
        comment: "External transaction ID from payment provider"
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    history: [{
        action: {
            type: String,
            required: true,
            enum: ["payment_initiated", "payment_completed", "payment_failed", "payment_cancelled", "discount_applied"]
        },
        by: { 
            type: Schema.Types.ObjectId, 
            ref: "User",
            required: true
        },
        date: { 
            type: Date, 
            default: Date.now 
        },
        note: String,
        metadata: {
            type: Map,
            of: String,
            comment: "Additional information about the action"
        }
    }]
}, {
    timestamps: true
});

// Add index for common queries
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ studentId: 1, createdAt: -1 });
PaymentSchema.index({ courseId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ term: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);