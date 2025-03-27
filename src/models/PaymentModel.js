const mongoose = require('mongoose');
const {Schema} = mongoose.Schema;

const PaymentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    coursePrice:{type: Number, required: true},
    amount: {type:Number, required: true},
    method: { type: String, enum: ["VNPAY", "MOMO", "cash"] },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
})
module.exports = mongoose.model("Payment", PaymentSchema);