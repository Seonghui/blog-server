import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export interface JWTUser {
  id: string;
  email: string;
}

const generateAccessToken = (user: JWTUser): string => {
  const payload = { id: user.id, email: user.email };
  const secret = process.env.JWT_SECRET as string;
  const options: SignOptions = { expiresIn: process.env.ACCESS_TOKEN_EXPIRY };

  return jwt.sign(payload, secret, options);
};

const generateRefreshToken = (user: JWTUser): string => {
  const payload = { id: user.id, email: user.email };
  const secret = process.env.JWT_REFRESH_SECRET as string;
  const options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRY };

  return jwt.sign(payload, secret, options);
};

const verifyAccessToken = (token: string): JwtPayload | string => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token: string): JwtPayload | string => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.verify(token, secret);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
