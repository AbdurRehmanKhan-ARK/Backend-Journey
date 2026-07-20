// WHY THIS FILE EXISTS - Multer (temp local storage) --> Cloudinary
// (permanent storage), instead of the browser uploading directly
// to Cloudinary. Reasons:
//
// 1. SECURITY - Cloudinary API key/secret must stay server-side only.
//    If the browser uploaded directly, these credentials would have
//    to live in frontend JS, visible to anyone via DevTools - anyone
//    could then abuse our Cloudinary account (unlimited uploads,
//    quota exhaustion, malicious file uploads).
//
// 2. VALIDATION CONTROL - the server needs to inspect/validate the
//    file (type, size, business rules) BEFORE it reaches Cloudinary.
//    A direct browser-to-Cloudinary upload skips our server entirely,
//    so we'd lose the ability to reject bad files before they're
//    permanently stored.
//
// 3. BUSINESS LOGIC SEQUENCING - e.g. in registerUser, we check for
//    duplicate users and validate all fields BEFORE ever touching
//    Cloudinary. This avoids wasting an upload on a request that's
//    going to fail anyway.
//
// 4. ATOMICITY - if the DB write fails after upload, our server can
//    catch that and respond with an error immediately. A direct
//    browser-to-Cloudinary flow could leave an "orphaned" file on
//    Cloudinary with no matching database record.
//
// Flow: Browser --> Multer (temp save on our server) --> Cloudinary
//       (permanent storage) --> temp file deleted from our server

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node's built-in file system module - used to delete the temp file after upload

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

    // upload the file - resource_type: "auto" lets Cloudinary detect whether
    // it's an image, video, or other file type automatically
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // upload succeeded - log the permanent Cloudinary URL for visibility
    console.log("File uploaded on cloudinary:", response.url);

    // the temp file on OUR server has done its job - remove it now that
    // Cloudinary has a permanent copy, so our server disk doesn't fill up
    fs.unlinkSync(filePath);

    return response;
  } catch (error) {
    // upload failed for some reason (bad file, network issue, invalid credentials, etc.)
    // still remove the temp file from our server - no point keeping a broken/unused upload attempt
    fs.unlinkSync(filePath);

    console.log("File upload failed:", error);
    return null;
  }
};

export { uploadOnCloudinary };
