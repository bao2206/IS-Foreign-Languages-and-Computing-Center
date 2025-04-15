const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify');
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
   numAllocatedPeriod:{
    type: Number,
    required: [true, "Please provide a num allocated period"]
   },
   is_special: {
       type: Boolean,
       default: false
   },
   ordering: {
       type: Number,
       required: [true, "Please provide a ordering"],
       min: [0, "Ordering must be greater than 0"],
       max: [100, "Ordering must be less than 100"]
   },
});

CourseSchema.pre("save", function(next) {
    this.slug = slugify(this.coursename, { lower: true, strict: true });
    next();
});

module.exports = mongoose.model("Course", CourseSchema);