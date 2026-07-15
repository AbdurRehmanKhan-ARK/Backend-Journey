// FILE UPLOAD FLOW:
// Browser → Backend Server (temporary storage) → Cloudinary (permanent storage)
//
// Multer saves the incoming file to a temp folder on our server first.
// This function then takes that temp file and pushes it to Cloudinary,
// which is where it will live permanently. Once uploaded, we no longer
// need the temp copy on our own server, so we delete it — success or fail.


import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node's built-in file system module — used to delete the temp file after upload

// Configure Cloudinary with credentials from .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Takes the local path of a temp file (saved earlier by Multer) and uploads it to Cloudinary.
// Returns the Cloudinary response object on success, or null on failure/missing path.
const uploadOnCloudinary = async (filePath) => {
  try {
    // if no path was passed in (e.g. Multer failed silently), nothing to upload
    if (!filePath) return null;

    // upload the file — resource_type: "auto" lets Cloudinary detect whether
    // it's an image, video, or other file type automatically
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // upload succeeded — log the permanent Cloudinary URL for visibility
    console.log("File uploaded on cloudinary:", response.url);

    // the temp file on OUR server has done its job — remove it now that
    // Cloudinary has a permanent copy, so our server disk doesn't fill up
    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    // upload failed for some reason (bad file, network issue, invalid credentials, etc.)
    // still remove the temp file from our server — no point keeping a broken/unused upload attempt
    fs.unlinkSync(filePath);

    console.log("File upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
