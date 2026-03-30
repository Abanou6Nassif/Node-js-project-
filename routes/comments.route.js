import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controller/comments.controller.js";

import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:type/:id", auth, createComment);
router.get("/:type/:id", getComments);
router.patch("/:type/:parentId/:commentId", auth, updateComment);
router.delete("/:type/:parentId/:commentId", auth, deleteComment);

export default router;
