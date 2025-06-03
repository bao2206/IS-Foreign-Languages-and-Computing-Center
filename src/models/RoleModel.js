const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['student', 'parent', 'teacher', 'admin', 'consultant', 'academic', 'finance']
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }],
    requiredFields: {
        staffFields: {
            citizenID: { type: Boolean, default: false },
            email: { type: Boolean, default: false },
            phone: { type: Boolean, default: false }
        },
        parentFields: {
            relationship: { type: Boolean, default: false },
            emergencyContact: {
                phone: { type: Boolean, default: false },
                address: { type: Boolean, default: false }
            }
        },
        studentFields: {
            age: { type: Boolean, default: false },
            grade: { type: Boolean, default: false }
        }
    },
    description: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Set default required fields based on role
RoleSchema.pre('save', function(next) {
    switch(this.name) {
        case 'admin':
        case 'teacher':
        case 'consultant':
        case 'finance':
            this.requiredFields.staffFields = {
                citizenID: true,
                email: true,
                phone: true
            };
            break;
        case 'parent':
            this.requiredFields.parentFields = {
                relationship: true,
                emergencyContact: {
                    phone: true,
                    address: false
                }
            };
            break;
        case 'student':
            this.requiredFields.studentFields = {
                age: true,
                grade: false
            };
            break;
    }
    next();
});

module.exports = mongoose.model("Role", RoleSchema);