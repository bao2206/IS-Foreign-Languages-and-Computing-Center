const mongoose = require('mongoose');
const { Schema } = mongoose;


const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

require('dotenv').config();


const UserSchema = new Schema({
    authId:{
        type: Schema.Types.ObjectId,
        ref: "Auth",
        required: [false, "Please provide a authId"],
    },
    name: {
        type: String,
        required: [true, "Please provide a username"],
        // unique: [true,"Please provide a unique username"],
        trim: [true, "Name must not contain leading or trailing spaces"],
        min: 0, 
        max: 50 
    },
    sex:{
        type: String,
        enum: ["male", "female"],
        default: "male"
    },
    email:{
        type: String,  
        required: [true, "Please provide a email"],
        unique: true,
        trim: [true, "Email must not contain leading or trailing spaces"],
        validate:{
            validator:(v) => emailRegex.test(v),
            message:"Email is invalid"
        }
    },
    citizenID: {
        type: String,
        required: [true, "Please provide a citizen ID"],
        unique: [true, "Please provide a unique citizen ID"],
        trim: [true, "Citizen ID must not contain leading or trailing spaces"],
        validate: {
          validator: (v) => /^\d{12}$/.test(v),
          message: "Citizen ID must be exactly 12 digits"
        }
      },
    phone:{
        type: String,
        unique:[true, "Phone is already exist"],
        validate:{
            validator:(v) => phoneRegex.test(v),
            message:"Phone is invalid. Please enter a valid phone number"
        }
    },
    address: {
        street: {type: String, 
          // required: true
          },
        city: {type: String, 
          // required: true
        },
        country: {type: String, 
          // required: true
        },
      },
    avatar: {type: String}, 
    status:{
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createdAt: {type: Date, default: Date.now},
})
module.exports = mongoose.model("User", UserSchema);