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
        // validate: {
        //     validator: (v) => phoneRegex.test(v),
        //     message: "Please provide a valid Vietnamese phone number"
        // }
    },
    email: {
        type: String,
    },
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
    parentName: {
        type: String,
        trim: true,
        default: ""
    },
    parentPhone: {
        type: String,
        trim: true,
    },
    parentEmail: {
        type: String,
        trim: true,
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


module.exports = mongoose.model("Contact", ContactSchema); 