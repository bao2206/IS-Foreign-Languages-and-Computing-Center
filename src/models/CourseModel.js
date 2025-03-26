const mongoose = require('mongoose');
const { Schema } = mongoose;
const CourseSchema = new Schema({
    coursename: {
        type: String, 
        required: [true, "Please provide a coursename"],
        unique: [true,"Please provide a unique coursename"],
        trim: [true, "Name must not contain leading or trailing spaces"],
        min: 3,
        max: 10
    },
   description: String,
   price: {
       type: Number,
       required: [true, "Please provide a price"],
       min: [0, "Price must be greater than 0"],
       
   },
   slug: String,
   numallocatedperiod:{
    type: Number,
    required: [true, "Please provide a numallocatedperiod"]
   }
});

module.exports = mongoose.model("Course", CourseSchema);