import mongoose from "mongoose";
import voteSchema from "./vote.model.js";
import commentSchema from "./comment.model.js";

const questionSchema = new mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    votes: [voteSchema],
    comments: [commentSchema],
  },
  {
    timestamps: true,
  },
);

const questionModel = mongoose.model("questions", questionSchema);

export default questionModel;
