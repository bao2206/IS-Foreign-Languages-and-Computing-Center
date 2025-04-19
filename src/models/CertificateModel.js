const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificateSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please provide a teacher ID"]
    },
    certificateName: {
        type: String,
        required: [true, "Please provide a certificate name"],
        trim: true,
    },
    information: {
        type: String,
        trim: true,
    },
    receivedDate: {
        type: Date,
        required: [true, "Please provide the date the certificate was received"]
    },
    expirationDate: {
        type: Date,
        required: [true, "Please provide the certificate expiration date"],
        validate: {
            validator: function(value) {
                return !this.receivedDate || value > this.receivedDate;
            },
            message: "Expiration date must be after the received date"
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", CertificateSchema);
