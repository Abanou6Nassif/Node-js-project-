import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controller/comments.controller.js";

import { allowedTo, auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:type/:id", auth,allowedTo("user"), createComment);
router.get("/:type/:id", getComments);
router.patch("/:type/:parentId/:commentId", auth,allowedTo("user"), updateComment);
router.delete("/:type/:parentId/:commentId", auth,allowedTo("user","admin"), deleteComment);

export default router;
