import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // stores reference to a User document
      ref: "User", // tells mongoose which model to populate from
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTodo", // array of references to SubTodo documents
      },
    ],
  },
  { timestamps: true },
);

export const Todo = mongoose.model("Todo", todoSchema);
