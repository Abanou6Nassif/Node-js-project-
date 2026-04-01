import mongoose from "mongoose";
import Question from "../model/question.model.js";
import Answer from "../model/answer.model.js";
// import { notify } from "./notification.controller.js";

export const voteQuestion = async (req, res) => {
  try {
    let { vote } = req.body;
    if (![1, -1, 0].includes(vote))
      return res.status(400).json({ message: "Invalid vote value" });

    const question = await Question.findById(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const userId = new mongoose.Types.ObjectId(req.id);
    const userIdStr = req.id;
    const io = req.app.get("io"); // ✅ هنا

    const existing = question.votes.find(v => v.user.toString() === userIdStr);

    // const sendNotify = async () => {
        
    //   if (question.author && question.author.toString() !== userIdStr) {
    //     await notify({
    //       receiverId: question.author.toString(),
    //       senderId: userIdStr,
    //       type: "vote",
    //       message: "Someone voted on your question",
    //       meta: { questionId: question._id },
    //       io, // ✅ مررها
    //     });
    //   }
    // };

    const removeVote = () => {
      question.score -= existing.vote;
      question.votes = question.votes.filter(v => v.user.toString() !== userIdStr);
    };

    if (existing) {
      if (existing.vote === vote || vote === 0) {
        removeVote();
        await question.save();
        // await sendNotify();
        return res.json({ message: "Vote removed", score: question.score });
      }

      removeVote();
      question.votes.push({ user: userId, vote });
      question.score += vote;
      await question.save();
    //   await sendNotify();
      return res.json({ message: "Vote updated", score: question.score });
    }

    if (vote === 0)
      return res.status(400).json({ message: "No vote to remove" });

    question.votes.push({ user: userId, vote });
    question.score += vote;
    await question.save();
    // await sendNotify();
    return res.json({ message: "Vote added", score: question.score });

  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const voteAnswer = async (req, res) => {
  try {
    let { vote } = req.body;

    if (![1, -1, 0].includes(vote)) {
      return res.status(400).json({ message: "Invalid vote value" });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.id);
    const userIdStr = req.id;

    const existing = answer.votes.find(
      (v) => v.user.toString() === userIdStr
    );

    const removeVote = () => {
      answer.score -= existing.vote;
      answer.votes = answer.votes.filter(
        (v) => v.user.toString() !== userIdStr
      );
    };

    if (existing) {
      if (existing.vote === vote || vote === 0) {
        removeVote();
        await answer.save();
        return res.json({ message: "Vote removed", score: answer.score });
      }

      removeVote();
      answer.votes.push({ user: userId, vote });
      answer.score += vote;
      await answer.save();
      return res.json({ message: "Vote updated", score: answer.score });
    }

    if (vote === 0) {
      return res.status(400).json({ message: "No vote to remove" });
    }

    answer.votes.push({ user: userId, vote });
    answer.score += vote;
    await answer.save();
    return res.json({ message: "Vote added", score: answer.score });

  } catch (err) {
    console.log("VOTE ANSWER ERROR:", err);
    res.status(500).json({ message: "Server error", err: err.message });
  }
};