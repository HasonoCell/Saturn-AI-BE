import { Request, Response } from "express";
import { userService } from "../services/userService";
import {
  LoginParams,
  RegisterParams,
  ResponseData,
  UserAuth,
} from "../types/user";
import { validateLoginParams, validateRegisterParams } from "../utils/validate";

export class UserController {
  /**
   * 用户注册
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const params: RegisterParams = req.body;

      // 验证参数
      validateRegisterParams(params);

      const userAuth = await userService.register(params);

      const response: ResponseData<UserAuth> = {
        data: userAuth,
        message: "注册成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "注册失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 用户登录
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const params: LoginParams = req.body;

      // 验证参数
      validateLoginParams(params);

      const userAuth = await userService.login(params);

      const response: ResponseData<UserAuth> = {
        data: userAuth,
        message: "登录成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "登录失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }
}

export const userController = new UserController();
