import mongoose from "mongoose";

// ❌ Basic way — no mongoose superpowers
// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   isActive: Boolean,
// })

// ✅ Correct way — with full validation
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // field must be filled
      unique: true, // no two users can have same username
      lowercase: true, // automatically converts to lowercase before saving
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false, // new users inactive by default
    },
  },
  { timestamps: true }, // auto adds createdAt and updatedAt fields
);

export const User = mongoose.model("User", userSchema);

// ⭐ Interview point: mongoose automatically pluralizes and lowercases
// the model name → "User" model is stored in MongoDB as the "users" collection
