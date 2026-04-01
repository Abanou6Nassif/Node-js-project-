import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import { appError } from "../utils/appError.js";
import asyncHandler from "express-async-handler";

export const auth = async (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization) {
    return next(new appError(401, "unauthenticated: No token provided"));
  }

  try {
    let decode = jwt.verify(authorization, process.env.JWT_SECRET);
    let user = await userModel.findById(decode.id);
    if (!user) {
      return next(new appError(401, "unauthenticated: User not found"));
      // return res.status(404).json({ message: "unauthenticated" });
    }

    req.role = user.role;
    req.id = user._id;
    next();
  } catch (err) {
    return next(err);
  }
};

export const allowedTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.role)) {
      return next(new appError(403, "You are not Authorized"));
      // return res.status(403).json({ message: "You are not Authorized" });
    }
    next();
  };
};
