import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt";
import type { ResponseData } from "../types";

// 扩展 Express 的 Request 类型，让 req.user 这个属性在中间件里有类型提示。
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// 检查前端 axios 请求拦截器的封装，如果有 token，每次发送请求时都应该携带上 token

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization token，并将用户信息附加到 req.user
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从请求头获取 Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const response: ResponseData<null> = {
        data: null,
        message: "缺少认证令牌",
        code: 401,
      };
      res.status(401).json(response);
      return;
    }

    // 提取 token（格式：Bearer <token> 或直接 <token>）
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      const response: ResponseData<null> = {
        data: null,
        message: "认证令牌格式错误",
        code: 401,
      };
      res.status(401).json(response);
      return;
    }

    // 验证 token
    const payload = verifyToken(token);
    
    // 将用户信息附加到请求对象
    req.user = payload;
    
    // 继续执行下一个中间件
    next();
  } catch (error: any) {
    const response: ResponseData<null> = {
      data: null,
      message: error.message === "Invalid token" ? "认证令牌无效或已过期" : "认证失败",
      code: 401,
    };
    res.status(401).json(response);
  }
};

/**
 * 可选认证中间件
 * 如果有 token 则验证，没有 token 则继续执行（不报错）
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // 没有 token，继续执行
      next();
      return;
    }

    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7)
      : authHeader;

    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = payload;
      } catch (error) {
        // token 无效，但不报错，只是不设置 user
        console.warn("Invalid token in optional auth:", error);
      }
    }
    
    next();
  } catch (error) {
    // 发生错误时也继续执行
    console.error("Error in optional auth:", error);
    next();
  }
};
