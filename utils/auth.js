import jwt from "jsonwebtoken";

export const signToken = (id, email, secret) => {
  return jwt.sign(
    {
      id,
      email,
    },
    secret,
    {
      expiresIn: "1h",
    },
  );
};
export const signRefreshToken = (id, email, secret) => {
  return jwt.sign(
    {
      id,
      email,
    },
    secret,
    {
      expiresIn: "1y",
    },
  );
};
