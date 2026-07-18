import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Ensure backend/uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Disk storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Images only! Allowed formats: jpeg, jpg, png, webp'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size
  fileFilter,
});

/**
 * Helper to upload a local file to Cloudinary if credentials exist,
 * or return the local static path.
 */
export const uploadToCloudinaryOrLocal = async (file) => {
  const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'airbnbai_properties',
      });
      // Delete local file after cloud upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error('Failed to clean up local temp upload:', err.message);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, using local path:', error.message);
      return `/uploads/${file.filename}`;
    }
  } else {
    // Return relative URL to serve locally
    return `/uploads/${file.filename}`;
  }
};
