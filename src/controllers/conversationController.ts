import type { Request, Response } from "express";
import type {
  ResponseData,
  ConversationType,
  AutoCreateConversationParams,
} from "../types";
import { conversationService } from "../services";

export class ConversationController {
  /**
   * 自动创建对话
   */
  async autoCreateConversation(req: Request, res: Response): Promise<void> {
    try {
      const { firstMessage } = req.body;

      // 从认证中间件获取用户信息
      const userId = req.user?.userId;

      if (!userId) {
        throw new Error("用户未认证");
      }

      if (!firstMessage || !firstMessage.trim()) {
        throw new Error("第一条消息不能为空");
      }

      const params: AutoCreateConversationParams = {
        firstMessage: firstMessage.trim(),
        userId,
      };

      const conversation = await conversationService.autoCreateConversation(
        params
      );

      const response: ResponseData<ConversationType> = {
        data: conversation,
        message: "自动创建对话成功！",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "自动创建对话失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 获取所有对话
   */
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

  /**
   * 获取单个对话
   */
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

  /**
   * 删除对话
   */
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
