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
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从请求头或 URL 参数获取 Authorization token
    const authHeader = req.headers.authorization;
    const tokenFromQuery = req.query.token as string;
    
    // 优先从请求头获取，如果没有则从URL参数获取
    let token: string | undefined;
    
    if (authHeader) {
      // 提取 token（格式：Bearer <token> 或直接 <token>）
      token = authHeader.startsWith("Bearer ") 
        ? authHeader.slice(7)
        : authHeader;
    } else if (tokenFromQuery) {
      // 从URL参数获取token（用于SSE连接）
      token = tokenFromQuery;
    }

    if (!token) {
      const response: ResponseData<null> = {
        data: null,
        message: "缺少认证令牌",
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
