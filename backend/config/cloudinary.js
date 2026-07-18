import { v2 as cloudinary } from 'cloudinary';

const configureCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary Configured Successfully');
    return true;
  } else {
    console.log('Cloudinary credentials missing. Property uploads will fall back to local disk storage.');
    return false;
  }
};

export { cloudinary, configureCloudinary };
