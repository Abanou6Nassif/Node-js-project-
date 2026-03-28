import Question from "../model/question.model.js";



import Answer from "../model/answer.model.js";



export const createQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body || !tags) {
      return res.status(400).json({ message: "All fields required" });
    }

    const question = await Question.create({
      title,
      body,
      tags,
       author: req.id,
     
    });

    res.status(201).json({
      message: "Question created",
      data: question,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    let { search, sort = "latest" } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "votes") sortOption = { score: -1 };

    const questions = await Question.find(query)
      .populate("author", "username")
      .sort(sortOption);

    res.json({
      total: questions.length,
      data: questions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSingleQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "username");

    if (!question) {
      return res.status(404).json({ message: "Not found" });
    }

    const answers = await Answer.find({ question: req.params.id })
      .populate("author", "username")
      .sort({ score: -1 });

    res.json({ question, answers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Not found" });
    }

    if (question.author.toString() !== req.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    question.title = req.body.title || question.title;
    question.body = req.body.body || question.body;
    question.tags = req.body.tags || question.tags;

    await question.save();

    res.json({ message: "Updated", data: question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Not found" });
    }

    if (question.author.toString() !== req.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await question.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
