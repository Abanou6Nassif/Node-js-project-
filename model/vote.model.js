import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  vote: {
    type: Number,
    required: true,
  },
});


export default voteSchema;
