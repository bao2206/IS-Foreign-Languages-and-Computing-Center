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
});
module.exports = mongoose.model("Role", RoleSchema);