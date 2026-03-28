import userModel from "../model/user.model.js";
import { signToken, signRefreshToken } from "../utils/auth.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateRandomNumber, sendEmail } from "../utils/email.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
dotenv.config();

export const signUp = async (req, res) => {
  // console.log(req.body);
  const { userName, email, password, role } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(404).json({ message: "User already exist" });
    }
    let profileData ;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      profileData = {
        filename: req.file.originalname,
        path: result.secure_url,
        publicId: result.public_id,
      };
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    }
    const newUser = new userModel({
      userName,
      email,
      password,
      role,
      profile: profileData,
    });
    await newUser.save();

    const token = signToken(
      newUser._id,
      newUser.email,
      newUser.userNumber,
      process.env.JWT_SECRET,
    );
    const refreshToken = signRefreshToken(
      newUser._id,
      newUser.email,
      newUser.userNumber,
      process.env.JWT_REFRESH_SECRET,
    );
    res.status(201).json({ message: "success", token, refreshToken });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages });
    }

    console.error("signUp Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};

export const logIn = async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(404).json({ message: "Invalid Email or Password" });
    }
    const token = signToken(
      user._id,
      user.email,
      user.userNumber,
      process.env.JWT_SECRET,
    );
    const refreshToken = signRefreshToken(
      user._id,
      user.email,
      user.userNumber,
      process.env.JWT_REFRESH_SECRET,
    );

    res.status(200).json({ message: "success", token, refreshToken });
  } catch (error) {
    console.error("logIn Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};

export const refreshToken = async (req, res) => {
  let { refresh } = req.body;
  try {
    let decdoe = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    let user = await userModel.findById(decdoe.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const token = signToken(
      user._id,
      user.email,
      user.userNumber,
      process.env.JWT_SECRET,
    );
    res.status(200).json({ message: "success", token });
  } catch (error) {
    console.error("refreshToken Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};

export const updateUser = async (req, res) => {
  let { id } = req.params;
  const { userName, password, oldPassword } = req.body;
  try {
    // console.log(id +" iddddd " + req.id)
    if(req.role!="admin"){
      if (id != req.id) {
        return res
          .status(403)
          .json({ message: "Forbidden: You can only update your own profile" });
      }
    }
    let user = await userModel.findById(id);
    if (!user) return res.status(404).json({ message: "user not found!" });

    if (password) {
      if (!oldPassword)
        return res.status(400).json({ message: "old password is required" });
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      user.password = password;
    }
    let oldPublicId;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      oldPublicId = user.profile?.publicId;
        
      user.profile = {
        filename: req.file.originalname,
        path: result.secure_url,
        publicId: result.public_id,
      };
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    } else if (req.body.removeProfile) {
      if (user.profile?.publicId) {
        await cloudinary.uploader.destroy(user.profile.publicId);
      }
      user.profile = {
        filename: null,
        path: "https://secure.gravatar.com/avatar/default?s=90&d=identicon",
        publicId: null,
      };
    }
    if (userName) user.userName = userName;
    await user.save();
    if (oldPublicId) {
      await cloudinary.uploader
        .destroy(oldPublicId)
        .catch((err) => console.error("Cleanup Error:", err));
    }
    res.status(200).json({ message: "success", data: user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages });
    }
    console.error("updateUser Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};

export const deleteUser = async (req, res) => {
  let { id } = req.params;
  try {
    if(req.role!="admin"){
    if (id != req.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own profile" });
    }
  }
    let user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: "user Not Found",
      });
    }
    return res.status(204).json({ message: "success" });
  } catch (error) {
    console.error("deleteUser Error:", error);
    res.status(500).json("something went wrong...");
    return;
  }
};

export const forgotPassword = async (req, res) => {
  let { email } = req.body;
  let user = await userModel.findOne({ email: email });
  // console.log(email);

  if (!user) {
    return res.status(404).json({
      message: "user Not Found",
    });
  }
  const OTP = generateRandomNumber();
  const hashedOTP = await bcrypt.hash(OTP.toString(), 10);
  user.OTP = hashedOTP;
  user.resetOTPExpiration = Date.now() + 15 * 60 * 1000;
  await user.save();

  const message = `
  <p>Hello,</p>

<p>We received a request to reset the password for your account.</p>

<p><strong>Your verification code (OTP) is:</strong></p>
<h2 style="color: #2e6ce4;">${OTP}</h2>

<p>This code is valid for 15 minutes only. Please use it before it expires.</p>

<p>If you did not request a password reset, you can safely ignore this email.</p>

<p>Best regards,<br>Stack Overflow Support Team</p>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: "reset password",
      message: message,
    });

    res
      .status(200)
      .json({ message: "Reset code sent to your email", data: user });
  } catch (error) {
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email. Try again later." });
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword, email, otp } = req.body;
  if (!otp || !newPassword)
    return res.status(400).json({ message: "Missing data" });

  try {
    const user = await userModel.findOne({
      email,
    });
    console.log(user);
    if (!user || user.resetOTPExpiration < Date.now()) {
      return res.status(400).json({ message: "OTP expired or user not found" });
    }
    const isValid = await bcrypt.compare(otp, user.OTP);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = newPassword;
    user.OTP = undefined;
    user.resetOTPExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages });
    }
    console.error("Error resetting password:", error);
    res.status(400).json({ message: "Error resetting password" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let users = await userModel.find().select("userName email userNumber");
    res.status(200).json({ message: "success", data: users });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export const getUser = async (req, res) => {
  let { id } = req.params;
  try {
    let user = await userModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "success", data: user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
