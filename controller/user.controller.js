import userModel from "../model/user.model.js";
import { signToken, signRefreshToken } from "../utils/auth.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateRandomNumber, sendEmail } from "../utils/email.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";
import { appError } from "../utils/appError.js";
import asyncHandler from "express-async-handler";
dotenv.config();

export const signUp = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
  const { userName, email, password, role } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    return next(new appError(400, "User already exists"));
  }
  let profileData;
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
});

export const logIn = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new appError(404, "Invalid Email or Password"));
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
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  let { refresh } = req.body;
  let decdoe = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
  let user = await userModel.findById(decdoe.id);
  if (!user) {
    return next(new appError(404, "User not found"));
  }

  const token = signToken(
    user._id,
    user.email,
    user.userNumber,
    process.env.JWT_SECRET,
  );
  res.status(200).json({ message: "success", token });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  const { userName, password, oldPassword } = req.body;
  if (id != req.id) {
    return next(
      new appError(403, "Forbidden: You can only update your own profile"),
    );
  }
  let user = await userModel.findById(id);
  if (!user) return next(new appError(404, "User not found"));
  if (password) {
    if (!oldPassword)
      return next(new appError(400, "old password is required"));
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(new appError(400, "Incorrect old password"));
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
      await cloudinary.uploader
        .destroy(user.profile.publicId)
        .catch((err) => console.error("Cleanup Error:", err));
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
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  if (req.role != "admin") {
    if (id != req.id) {
      return next(
        new appError(403, "Forbidden: You can only delete your own profile"),
      );
    }
  }
  let user = await userModel.findById(id);
  if (!user) {
    return next(new appError(404, "user Not Found"));
  }
  if (user.profile?.publicId) {
    await cloudinary.uploader
      .destroy(user.profile.publicId)
      .catch((err) => console.error("Cleanup Error:", err));
  }
  await user.deleteOne();
  return res.status(204).json({ message: "success" });
});

export const forgotPassword = asyncHandler(async (req, res,next) => {
  let { email } = req.body;
  let user = await userModel.findOne({ email: email });
  // console.log(email);

  if (!user) {
    return next(new appError(404,"User not found"));
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
    // console.error("Error sending email:", error);

    return next(new appError(500,"Error sending email. Try again later."));
  }
});

export const resetPassword = asyncHandler(async (req, res,next) => {
  const { newPassword, email, otp } = req.body;
  if (!otp || !newPassword)
    return next(new appError(400,"Missing OTP or new password"));

  const user = await userModel.findOne({
    email,
  });
  console.log(user);
  if (!user || user.resetOTPExpiration < Date.now())
    return next(new appError(400,"OTP expired or user not found"));

  const isValid = await bcrypt.compare(otp, user.OTP);
  if (!isValid) {
    return next(new appError(400,"Invalid OTP"));
  }

  user.password = newPassword;
  user.OTP = undefined;
  user.resetOTPExpiration = undefined;
  await user.save();

  res.status(200).json({ message: "Password successfully reset" });
});

export const getAllUsers = asyncHandler(async (req, res,next) => {
  let users = await userModel.find().select("userName email userNumber profile");
  res.status(200).json({ message: "success", data: users });
});

export const getUser = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  let user = await userModel
    .findById(id)
    .select("userName email userNumber profile");
  if (!user) {
    return next(new appError(404, "User not found"));
  }
  res.status(200).json({ message: "success", data: user });
});
