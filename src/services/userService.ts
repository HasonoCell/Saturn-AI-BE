import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { LoginParams, RegisterParams, UserAuth } from "../types/user";
import { generateToken } from "../utils/jwt";

export class UserService {
  /**
   * 用户注册
   */
  async register(params: RegisterParams): Promise<UserAuth> {
    const { username, password, nickname } = params;

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error("用户名已存在");
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nickname,
      },
    });

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
    });

    return {
      nickname: user.nickname,
      token,
    };
  }

  /**
   * 用户登录
   */
  async login(params: LoginParams): Promise<UserAuth> {
    const { username, password } = params;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error("用户名或密码错误");
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("用户名或密码错误");
    }

    // 生成token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
    });

    return {
      nickname: user.nickname,
      token,
    };
  }
}

export const userService = new UserService();
