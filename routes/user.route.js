import express from "express";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUser,
  logIn,
  refreshToken,
  resetPassword,
  signUp,
  updateUser,
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { auth, allowedTo } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", upload.single("profilePhoto"), signUp);
router.post("/login", logIn);
router.post("/refreshtoken", refreshToken);
router.patch("/:id", auth, upload.single("profilePhoto"), updateUser);
router.delete("/:id", auth, deleteUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword", resetPassword);
router.get("/", auth, allowedTo("admin"), getAllUsers);
router.get("/:id", getUser);

export default router;
