import type { Request, Response } from "express";
import type {
  ResponseData,
  ConversationType,
  CreateConversationParams,
} from "../types";
import { conversationService } from "../services";
import { validateConversationParams } from "../utils/validate";

export class ConversationController {
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body;

      // 从认证中间件获取用户信息（./middlewares/auth.ts）
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error("用户未认证");
      }

      const params: CreateConversationParams = {
        title,
        description,
        userId,
      };

      validateConversationParams(params);

      const conversation = await conversationService.createConversation(params);

      const response: ResponseData<ConversationType> = {
        data: conversation,
        message: "创建对话成功！",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "创建对话失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  async getAllConversationsByUserId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) throw new Error("用户未认证");

      const conversations: ConversationType[] =
        await conversationService.getAllConversationsByUserId(userId);

      const response: ResponseData<ConversationType[]> = {
        data: conversations,
        message: "获取所有对话成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "获取所有对话失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  async getSingleConversationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; // 本次对话的ID从路径参数获取
      const userId = req.user?.userId; // 所属用户的ID从认证中间件获取

      if (!id) throw new Error("请传入对话ID");
      if (!userId) throw new Error("用户未认证");

      const conversation: ConversationType =
        await conversationService.getSingleConversationById(id, userId);

      const response: ResponseData<ConversationType> = {
        data: conversation,
        message: "获取对话详情成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "获取对话详情失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; // 本次对话的ID从路径参数获取
      const userId = req.user?.userId; // 所属用户的ID从认证中间件获取

      if (!id) throw new Error("请传入对话ID");
      if (!userId) throw new Error("用户未认证");

      const result = await conversationService.deleteConversation(id, userId);

      const response: ResponseData<{ success: boolean }> = {
        data: result,
        message: "删除对话成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "删除对话失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }
}

export const conversationController = new ConversationController();
