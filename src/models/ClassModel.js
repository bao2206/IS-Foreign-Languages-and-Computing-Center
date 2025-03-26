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
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
    quantity: { type: Number, 
        required: [true, "Please provide a quantity"],
        min: [1, "Quantity must be greater than 1"],
     },
    materials: [String],
    daybegin: { type: Date, required: [true, "Please provide a daybegin"],
        validate: {
            validator: function (v) {
                return v >= new Date();
            },
            message: "Start date must be today or in the future"
        },
     },
    dayend: { type: Date, required: [true, "Please provide a dayend"],
        validate:{function (v) {
            return v >= this.daybegin;
        }},
        message: "End date must be greater than start date"
     },
  });
  
module.exports = mongoose.model("Class", ClassSchema);
  