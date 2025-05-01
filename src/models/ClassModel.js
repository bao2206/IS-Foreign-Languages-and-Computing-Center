const mongoose = require("mongoose");
const {Schema} = mongoose;

const ClassSchema = new Schema({
    classname: {type: String,
        required: [true, "Please provide a classname"],
        unique: [true,"Please provide a unique classname"],
        trim: [true, "Name must not contain leading or trailing spaces"],
        min: 3,
        max: 10
    },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    teacher: [{ type: Schema.Types.ObjectId, ref: "Teacher" }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    quantity: { type: Number, 
        required: [false, "Please provide a quantity"],
        min: [1, "Quantity must be greater than 1"],
     },
    materials: [String],
    daybegin: { type: Date, required: [false, "Please provide a day begin"],
        validate: {
            validator: function (v) {
                return v >= new Date();
            },
            message: "Start date must be today or in the future"
        },
     },
    status: {
        type: String,
        enum: ["Incomplete", "Complete"],
        default: "Incomplete",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
  });
  
module.exports = mongoose.model("Class", ClassSchema);
  