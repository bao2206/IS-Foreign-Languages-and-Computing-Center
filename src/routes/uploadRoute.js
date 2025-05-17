require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const { asyncHandle } = require("../utils/asyncHandle");
const ImageModel = require("../models/ImageModel");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Uploads",
    format: async (req, file) =>
      path.extname(file.originalname).slice(1) || "png",
    public_id: (req, file) => path.parse(file.originalname).name,
    access_mode: "authenticated",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  onError: (err, next) => {
    console.error("Multer error:", err);
    next(err);
  },
});

router.post(
  "/",
  upload.array("image", 10),
  asyncHandle(async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const imageUrls = req.files.map((file) => file.path || file.secure_url);
    imageUrls.map((url) =>
      ImageModel.create({
        url: url,
      })
    );
    res.json({ imageUrls });
  })
);

router.get(
  "/",
  asyncHandle(async (req, res) => {
    cloudinary.api.resources(
      {
        type: "upload",
        prefix: "Uploads/", // Chỉ lấy ảnh trong thư mục Uploads
      },
      (error, result) => {
        if (error) {
          console.error("Error fetching images:", error);
        } else {
          console.log("Uploaded images:", result.resources);
        }
      }
    );
  })
);
module.exports = router;
