import questionModel from "../model/question.model.js";
import answerModel from "../model/answer.model.js";

export const createComment = async (req, res) => {
  try {
    const { body } = req.body;
    const { type, id } = req.params;

    if (!body) {
      return res.status(400).json({ message: "Comment body is required" });
    }

    if (!["question", "answer"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    let doc;

    if (type === "question") {
      doc = await questionModel.findById(id);
    } else {
      doc = await answerModel.findById(id);
    }

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const newComment = {
      body,
      author: req.id,
    };

    doc.comments.push(newComment);
    await doc.save();

    res.status(201).json({
      message: "Comment added successfully",
      data: doc.comments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["question", "answer"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    let doc;

    if (type === "question") {
      doc = await questionModel
        .findById(id)
        .populate("comments.author", "userName");
    } else {
      doc = await answerModel
        .findById(id)
        .populate("comments.author", "userName");
    }

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      total: doc.comments.length,
      data: doc.comments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { type, parentId, commentId } = req.params;
    const { body } = req.body;

    if (!["question", "answer"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    let doc;

    if (type === "question") {
      doc = await questionModel.findById(parentId);
    } else {
      doc = await answerModel.findById(parentId);
    }

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const comment = doc.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.author.toString() != req.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (body) comment.body = body;

    await doc.save();

    res.json({
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { type, parentId, commentId } = req.params;

    if (!["question", "answer"].includes(type)) {
      return res.status(400).json({ message: "Invalid type" });
    }

    let doc;

    if (type === "question") {
      doc = await questionModel.findById(parentId);
    } else {
      doc = await answerModel.findById(parentId);
    }

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    const comment = doc.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.author.toString() != req.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    comment.deleteOne();

    await doc.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
