import  userModel  from "../model/user.model.js";
import {signToken,signRefreshToken} from "../utils/auth.js";
import dotenv from "dotenv";

dotenv.config();


export const signUp = async (req, res) => {
    // console.log(req.body);
  const { userName, email, password, profilePhoto, role } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(404).json({ message: "User already exist" });
    }

    const newUser = new userModel({ userName, email, password, role });
    await newUser.save();

    const token = signToken(
      newUser._id,
      newUser.email,
      process.env.JWT_SECRET,
    );
    const refreshToken = signRefreshToken(
      newUser._id,
      newUser.email,
      process.env.JWT_REFRESH_SECRET,
    );
      res.status(201).json({ message: "success", token, refreshToken });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages });
    }

    console.error("Signup Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};
