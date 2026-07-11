import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    description: {
      required: true,
      type: String,
    },
    productImage: {
      required: true,
      type: String,
      // images are too heavy to store even for a strong DB like MongoDB,
      // so we store image URLs instead of the actual files.
      // Strategy: upload image to Cloudinary first, then store the returned URL here.
      // Cloudinary = a cloud storage service for images/videos/media files.
    },
    price: {
      required: true,
      type: Number,
    },
    stock: {
      default: 0,
      required: true,
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
