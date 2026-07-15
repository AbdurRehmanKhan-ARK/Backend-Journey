// Multer handles incoming file uploads (multipart/form-data) since Express's
// default express.json()/express.urlencoded() only understand text data,
// not binary files. This middleware saves the uploaded file to a temp folder
// on OUR server first - it's the first step in the upload flow:
// Browser → Backend Server (temp storage) → Cloudinary (permanent storage)

import multer from "multer";

// diskStorage tells Multer WHERE and with WHAT NAME to save the file
const storage = multer.diskStorage({
  // destination: decides the folder the file gets saved to temporarily
  destination: function (req, file, cb) {
    // cb follows the (error, value) pattern - first arg is for errors (null = no error),
    // second arg is the actual value being returned
    cb(null, "./public/temp"); // temp folder - file lives here only briefly
  },

  // filename: decides what the saved file will be called on our server
  filename: function (req, file, cb) {
    // ⚠️ using the original filename as-is is risky in production - if two
    // users upload files with the same name (e.g. "photo.jpg"), one can
    // overwrite the other before it even reaches Cloudinary.
    // Safer alternative: cb(null, Date.now() + "-" + file.originalname)
    cb(null, file.originalname);
  },
});

// upload is the actual middleware we'll plug into routes, e.g.:
// router.post("/register", upload.fields([{ name: "avatar" }]), registerUser)
export const upload = multer({ storage });
