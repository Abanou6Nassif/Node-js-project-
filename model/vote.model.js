import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref:"user"
  },
  vote: {
    type: Number,
    required: true,
  },
});


export default voteSchema;
