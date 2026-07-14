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
    username: {
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
    avatar: {
      type: String,
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
// dont use arrow func syntax because it does not bind this keyword whereas we crucally need this keyword to get current context/user-details and use async  because its a long running task
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // because only on password field modification we want to encrypt not on other fields modifications too (like username)
  this.password = bcrypt.hash(this.password, 10);
  next();
});

// now we will design a method to verify that user's given password is correct or not at certain stages
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypy.compare(password, this.password); // (passwordEntered, hashedPasswordStoredInDb)
};

// another method to generate access and refresh Tokens , both are JWT (going with session and cookie based authorization)

// access token usually holds high payload
userSchema.methods.generateAccessToken = function () {
  jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },process.env.ACCESS_TOKEN_SECRET,
    { 
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    }
  );
};

// whereas refresh token holds low payload like ID
userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    {
      _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateAccessToken = function () {};
export const User = mongoose.model("User", userSchema);
