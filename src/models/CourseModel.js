const mongoose = require("mongoose");
const { Schema } = mongoose;
const slugify = require("slugify");
const CourseSchema = new Schema({
  coursename: {
    type: String,
    required: [true, "Please provide a coursename"],
    unique: [true, "Please provide a unique coursename"],
    trim: [true, "Name must not contain leading or trailing spaces"],
    min: 3,
    max: 10,
  },
  description: String,
  catalog: {
    type: String,
    enum: ["Languages", "Computing", "None", "Languages and Computing"],
    default: "None",
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
    min: [0, "Price must be greater than 0"],
  },
  slug: {
    type: String,
    unique: true,
    required: false,
  },
  image: {
    type: [String],
    required: [false, "Please provide a image"],
  },
  numAllocatedPeriod: {
    type: Number,
    required: [true, "Please provide a num allocated period"],
  },
  is_special: {
    type: Boolean,
    default: false,
  },
  ordering: {
    type: Number,
    required: [true, "Please provide a ordering"],
    min: [0, "Ordering must be greater than 0"],
    max: [100, "Ordering must be less than 100"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  discount: {
    type: Schema.Types.ObjectId,
    ref: "Discount",
  },
});

CourseSchema.pre("save", function (next) {
  this.slug = slugify(this.coursename, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
