const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // URL từ Cloudinary
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", ImageSchema);
