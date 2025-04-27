const mongoose = require('mongoose');
const {Schema} = mongoose;
const slugify = require('slugify');
const PermissionSchema = new Schema({
    key: {
        type: String,
        required: [true, 'Key is required'],
        unique: true,
        minlength: [3, 'Key must be at least 3 characters long'],
        maxlength: [50, 'Key cannot exceed 50 characters'],
        match: [/^[a-zA-Z_]+$/, 'Key can only contain letters and underscores'],
      },
      name: {
        type: String,
        unique: true,
      },
      description: {
        type: String,
        maxlength: [255, 'Description must be less than 255 characters'],
      },
} ,{timestamps: true},);

PermissionSchema.pre("save", function(next) {
    this.name = slugify(this.key, { lower: true, strict: true });
    next();
})
module.exports = mongoose.model('Permission', PermissionSchema);