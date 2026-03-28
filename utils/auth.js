import jwt from "jsonwebtoken";

export const signToken = (id, email, userNumber, secret) => {
  return jwt.sign(
    {
      id,
      email,
      userNumber,
    },
    secret,
    {
      expiresIn: "1h",
    },
  );
};
export const signRefreshToken = (id, email, userNumber, secret) => {
  return jwt.sign(
    {
      id,
      email,
      userNumber,
    },
    secret,
    {
      expiresIn: "1y",
    },
  );
};
