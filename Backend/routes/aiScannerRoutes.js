const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const { analyzeFoodImage } = require("../controllers/aiScannerController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 8 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    }
  }
});

router.post(
  "/analyze",
  protect,
  upload.single("image"),
  analyzeFoodImage
);

module.exports = router;
