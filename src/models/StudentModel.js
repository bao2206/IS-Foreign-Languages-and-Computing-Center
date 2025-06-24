const mongoose = require("mongoose");

const { Schema } = mongoose;

const StudentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    parentId:{
        type: Schema.Types.ObjectId, ref: 'Parent'
    },
    classId:[{
        type: Schema.Types.ObjectId, ref: 'Class'
    }],
    points: [{
        type: Schema.Types.ObjectId, ref: 'Point'
    }],
    attendance:[{
        type: Schema.Types.ObjectId, ref: 'Attendance'
    }]
});

module.exports = mongoose.model("Student", StudentSchema);

const UserService = require("../services/userService");
const AuthService = require("../services/AuthService");
const RoleService = require("../services/RoleService");
const StudentModel = require("../models/StudentModel");
const ClassModel = require("../models/ClassModel");
const { generateUsername, generatePassword } = require("../utils/userUtils");
