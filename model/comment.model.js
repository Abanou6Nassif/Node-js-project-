import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


export default commentSchema;
