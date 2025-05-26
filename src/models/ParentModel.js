const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParentSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        unique: true 
    },
    students: [{ 
        type: Schema.Types.ObjectId, 
        ref: "Student" 
    }],
    relationship: {
        type: String,
        enum: ["father", "mother", "guardian"],
        required: true
    },
    emergencyContact: {
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    paymentHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Payment"
    }],
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for common queries
// ParentSchema.index({ userId: 1 }, { unique: true });
// ParentSchema.index({ status: 1 });
// ParentSchema.index({ "emergencyContact.phone": 1 });

module.exports = mongoose.model("Parent", ParentSchema);