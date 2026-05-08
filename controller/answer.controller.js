import answerModel from "../model/answer.model.js";
import questionModel from "../model/question.model.js";
import { appError } from "../utils/appError.js";
import { catchError } from "../utils/catchError.js";

//Viewing all the answers
export const getAllAnswers = catchError(async (req, res) => {
  const { questId } = req.params;
  if (!questId) {
    throw new appError(400, "Question ID is required");
  }

  let question = await questionModel.findById(questId);
  if (!question) {
    throw new appError(404, "Question not found");
  }
  let allAns = await answerModel.find({ question: questId });

  if (allAns.length === 0) {
    throw new appError(404, "No answers available for that question");
  }

  res.status(200).json({ Question: question.title, Answers: allAns });
});

//Adding new Answer
export const addAnswer = catchError(async (req, res) => {
  const { questId } = req.params;
  const author = req.id;
  let { body } = req.body;

  if (!questId || !body) {
    throw new appError(400, "question ID and body are required");
  }

  let question = await questionModel.findById(questId);
  if (!question) {
    throw new appError(404, "Question not found");
  }

  let answer = await answerModel.create({ author, question: questId, body });

  res.status(201).json({ Answer: answer });
});

//Editing an Answer
export const editAnswer = catchError(async (req, res) => {
  const { questId, answerId } = req.params;
  const userId = req.id;

  let { body } = req.body;

  if (!questId || !body || !answerId) {
    throw new appError(400, "question ID, answer ID, and body are required");
  }

  let question = await questionModel.findById(questId);
  let answer = await answerModel.findById(answerId);
  if (!answer || !question)
    throw new appError(404, "The Question or Answer not found");

  if (!answer.question.equals(questId))
    throw new appError(
      400,
      "Bad request, the answer should be related to that question",
    );

  if (!answer.author.equals(userId))
    throw new appError(403, "You're not authorized");
  answer = await answerModel.findByIdAndUpdate(
    answerId,
    { body: body },
    { returnDocument: "after", runValidators: true },
  );
  res.status(200).json({ Answer: answer });
});

//Deleting an answer
export const deleteAnswer = catchError(async (req, res) => {
  const { questId, answerId } = req.params;
  const userId = req.id;

  if (!questId || !answerId) {
    throw new appError(400, "question ID and answer ID are required");
  }

  let question = await questionModel.findById(questId);
  let answer = await answerModel.findById(answerId);
  if (!answer || !question)
    throw new appError(404, "The Question or Answer not found");

  if (!answer.question.equals(questId))
    throw new appError(
      400,
      "Bad request, the answer should be related to that question",
    );

  if (!answer.author.equals(userId) && req.role !== "admin")
    throw new appError(403, "You're not authorized");
  answer = await answerModel.findByIdAndDelete(answerId);
  res.status(204).end();
});
