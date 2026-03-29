import express from "express";
import { allowedTo, auth } from "../middleware/auth.middleware.js";
import {
  getAllAnswers,
  addAnswer,
  editAnswer,
  deleteAnswer,
} from "../controller/answer.controller.js";

const router = express.Router();

router.get("/:questId", getAllAnswers);
//***check with the other team members  whether allowedTo() is needed here or can be omitted.
router.post("/:questId", auth, allowedTo("user"), addAnswer);
router.post("/:questId/:answerId", auth, allowedTo("user"), editAnswer);
router.post("/:questId/delete/:answerId", auth, allowedTo("user"), deleteAnswer);

export default router;