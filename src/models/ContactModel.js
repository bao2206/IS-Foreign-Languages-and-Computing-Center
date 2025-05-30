const mongoose = require('mongoose');
const { Schema } = mongoose;

const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide your name"],
        trim: [true, "Name must not contain leading or trailing spaces"],
        min: 2,
        max: 50
    },
    phone: {
        type: String,
        required: [true, "Please provide your phone number"],
        validate: {
            validator: (v) => phoneRegex.test(v),
            message: "Please provide a valid Vietnamese phone number"
        }
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        validate: {
            validator: (v) => emailRegex.test(v),
            message: "Please provide a valid email address"
        }
    },
    // courseInterest: {
    //     type: String,
    //     required: [true, "Please provide the course you are interested in"],
    //     trim: true
    // },
    consultationContent: {
        type: String,
        required: [true, "Please provide your consultation content"],
        trim: true,
        minlength: [10, "Consultation content must be at least 10 characters long"]
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "processed", "cancelled", "class_assigned"],
            message: "Status must be one of: pending, processed, cancelled, class_assigned"
        },
        default: "pending"
    },
    assignedClass: {
        type: Schema.Types.ObjectId,
        ref: "Class",
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ""
    },
    processedBy: {
        type: Schema.Types.Mixed,  // This allows both String and ObjectId
        default: null
    },
    processedAt: {
        type: Date,
        default: null
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

// // Add indexes for common queries
// ContactSchema.index({ status: 1, createdAt: -1 });
// ContactSchema.index({ phone: 1 });
// ContactSchema.index({ email: 1 });

// // Add method to check if consultation is pending
// ContactSchema.methods.isPending = function() {
//     return this.status === 'pending';
// };

// // Add method to check if consultation is processed
// ContactSchema.methods.isProcessed = function() {
//     return this.status === 'processed';
// };

// // Add method to check if consultation is assigned to a class
// ContactSchema.methods.isAssignedToClass = function() {
//     return this.status === 'class_assigned';
// };

// // Add static method to find pending consultations
// ContactSchema.statics.findPending = function() {
//     return this.find({ status: 'pending' });
// };

// // Add static method to find processed consultations
// ContactSchema.statics.findProcessed = function() {
//     return this.find({ status: 'processed' });
// };

// // Add static method to find consultations by status
// ContactSchema.statics.findByStatus = function(status) {
//     return this.find({ status });
// };

module.exports = mongoose.model("Contact", ContactSchema); 