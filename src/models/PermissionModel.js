const mongoose = require('mongoose');
const {Schema} = mongoose;
const slugify = require('slugify');
const PermissionSchema = new Schema({
    key: {type: String, required: true, unique: true},
    name: { type: String, required: true, unique: true },  
    description: { type: String },  
});

PermissionSchema.pre("save", function(next) {
    this.name = slugify(this.key, { lower: true, strict: true });
})
module.exports = mongoose.model('Permission', PermissionSchema);