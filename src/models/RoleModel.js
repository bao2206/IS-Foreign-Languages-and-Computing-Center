const mongoose = require('mongoose');
const { Schema } = mongoose;

const RoleSchema = new Schema({
    name : {
        type: String ,
        required: true,
        unique: true,
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId, ref: "Permission"
    }],
},{timestamps: true},);
module.exports = mongoose.model("Role", RoleSchema);