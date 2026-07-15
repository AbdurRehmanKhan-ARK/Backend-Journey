import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // useful in searching in database
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary URL stored here
      required: true,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// using a hook/middleware to encrypt user passwords
// don't use arrow function syntax - it doesn't bind 'this', and we need 'this'
// to access the current document. Using async because hashing is a long-running task.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if password field actually changed
  this.password = await bcrypt.hash(this.password, 10); // must await — hash() returns a Promise
  next();
});

// verify user's given password against the stored hashed password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // (passwordEntered, hashedPasswordInDb)
};

// access token usually holds high payload — short-lived
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// refresh token holds low payload (just ID) — long-lived
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
