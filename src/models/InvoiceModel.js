const mongoose = require('mongoose');
const {Schema} = mongoose.Schema;
const InvoiceSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    details: String,
    issuedAt: { type: Date, default: Date.now }
})