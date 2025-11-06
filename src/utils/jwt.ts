import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  username: string;
  nickname: string;
}

const JWT_SECRET_KEY = (process.env.JWT_SECRET as string) || "JWT_SECRET_KEY";

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
