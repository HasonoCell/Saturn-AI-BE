import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export interface JwtPayload {
  userId: string;
  username: string;
  nickname: string;
}

dotenv.config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}

/**
 * 生成JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

/**
 * 验证JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

/**
 * 解析token（不验证有效性）
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
