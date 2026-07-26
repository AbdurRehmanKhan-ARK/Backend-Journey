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


// Deletes a file from Cloudinary given its full URL. Used when replacing
// an avatar/coverImage - the OLD file must be explicitly deleted, since
// updating the DB reference alone does NOT remove the actual file from
// Cloudinary's storage; it just orphans it there permanently.
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;

    // Cloudinary URLs look like:
    // http://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<extension>
    // The public_id is everything after the version segment, minus the
    // file extension - Cloudinary needs the public_id (not the full URL)
    // to identify which file to delete.
    const urlParts = fileUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split(".")[0];

    const response = await cloudinary.uploader.destroy(publicId);

    console.log("File deleted from cloudinary:", publicId);
    return response;
  } catch (error) {
    // Deletion failing shouldn't crash the whole request - the new
    // file is already uploaded and the DB already updated by this
    // point in the calling controller, so we just log and move on.
    // Worst case: one orphaned file remains, which is the same
    // problem we had before, not a NEW problem.
    console.log("Failed to delete file from cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
