import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controller/question.controller.js";

import { auth, allowedTo } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/", auth, createQuestion);
router.get("/", getAllQuestions);
router.get("/:id", getSingleQuestion);
router.put("/:id", auth, allowedTo("author", "admin"), updateQuestion);
router.delete("/:id", auth, allowedTo("author", "admin"), deleteQuestion);

export default router;
