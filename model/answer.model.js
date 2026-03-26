import mongoose from "mongoose";
import voteSchema from "./vote.model.js";
import commentSchema from "./comment.model.js";

const answerSchema = new mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "question",
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
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

const answerModel = mongoose.model("answers", answerSchema);

export default answerModel;
