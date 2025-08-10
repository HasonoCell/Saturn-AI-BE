import type { Request, Response } from "express";
import type { ResponseData, MessageType, SendMessageParams } from "../types";
import { messageService } from "../services";

export class MessageController {
  /**
   * 获取对话中的所有消息
   */
  async getAllMessagesByConversationId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;

      if (!conversationId) throw new Error("请传入对话ID");
      if (!userId) throw new Error("用户未认证");

      const messages = await messageService.getAllMessagesByConversationId(
        conversationId,
        userId
      );

      const response: ResponseData<{ messages: MessageType[] }> = {
        data: { messages },
        message: "获取消息列表成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "获取消息列表失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 发送消息并获取AI回复
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!conversationId) throw new Error("请传入对话ID");
      if (!content || !content.trim()) throw new Error("消息内容不能为空");
      if (!userId) throw new Error("用户未认证");

      const params: SendMessageParams = {
        content: content.trim(),
        conversationId,
        userId,
      };

      const result = await messageService.sendMessage(params);

      const response: ResponseData<{
        aiMessage: MessageType;
      }> = {
        data: result,
        message: "消息发送成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "消息发送失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }
}

export const messageController = new MessageController();
