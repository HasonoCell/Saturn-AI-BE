import type { Request, Response } from "express";
import type {
  ResponseData,
  MessageType,
  SendMessageParams,
  FirstMessageReturn,
  SearchMessageItem,
} from "../types";
import { messageService } from "../services";
import { conversationService } from "../services";

export class MessageController {
  /**
   * 获取对话中的所有消息
   */
  async getAllMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;

      if (!conversationId) throw new Error("请传入对话ID");
      if (!userId) throw new Error("用户未认证");

      const messages = await messageService.getAllMessages(
        conversationId,
        userId
      );

      const response: ResponseData<MessageType[]> = {
        data: messages,
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
   * 保存用户消息到数据库
   */
  async sendUserMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!conversationId) throw new Error("请传入对话ID");
      if (!content || !content.trim()) throw new Error("消息内容不能为空");
      if (!userId) throw new Error("用户未认证");

      const params: SendMessageParams = {
        conversationId,
        content: content.trim(),
        userId,
      };

      // 这里就不用返回创建了的 UserMessage 给前端了，前端会负责包装 UserMessage 并加入状态管理中
      await messageService.sendUserMessage(params);

      const response: ResponseData<null> = {
        data: null,
        message: "用户消息发送成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "用户消息发送失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 自动创建对话并发送第一条消息
   */
  async autoCreateAndSendFirstMessage(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { content } = req.body;
      const userId = req.user?.userId;

      if (!content || !content) throw new Error("消息内容不能为空");
      if (!userId) throw new Error("用户未认证");

      // 1. 自动创建对话
      const conversation = await conversationService.autoCreateConversation({
        firstMessage: content,
        userId,
      });

      // 2. 保存用户消息
      await messageService.sendUserMessage({
        conversationId: conversation.id,
        content: content,
        userId,
      });

      // 3. 返回对话信息
      const response: ResponseData<FirstMessageReturn> = {
        data: {
          conversationId: conversation.id,
          title: conversation.title,
        },
        message: "自动创建对话并获取AI回复成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "自动创建对话并发送消息失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 建立SSE连接，获取AI流式回复
   */
  async getAIStream(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.userId;

      if (!conversationId) throw new Error("请传入对话ID");
      if (!userId) throw new Error("用户未认证");

      const completion$ = await messageService.getAIStream(
        conversationId,
        userId
      );

      // 设置 SSE 连接必要响应头
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const subscription = completion$.subscribe({
        next: (content: string) => {
          const response: ResponseData<string> = {
            data: content,
            message: "chunk",
            code: 200,
          };

          // 将数据写入流中
          res.write(`data: ${JSON.stringify(response)}\n\n`);
        },
        error: (error: any) => {
          const errorResponse: ResponseData<null> = {
            data: null,
            message: error.message || "流式响应错误",
            code: 500,
          };

          res.write(`data: ${JSON.stringify(errorResponse)}\n\n`);
          res.end();
        },
        complete: () => {
          const endResponse: ResponseData<null> = {
            data: null,
            message: "end",
            code: 200,
          };

          res.write(`data: ${JSON.stringify(endResponse)}\n\n`);
          res.end();
        },
      });

      // 处理客户端断开连接
      req.on("close", () => {
        subscription.unsubscribe();
      });
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "获取AI流式回复失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }

  /**
   * 搜索消息
   */
  async searchMessages(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const userId = req.user?.userId;

      if (!query || !query.toString().trim()) {
        throw new Error("搜索关键词不能为空");
      }

      if (!userId) throw new Error("用户未认证");

      const searchResults = await messageService.searchMessages({
        query: query.toString().trim(),
        userId,
      });

      const response: ResponseData<SearchMessageItem[]> = {
        data: searchResults,
        message: "搜索消息成功",
        code: 200,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: ResponseData<null> = {
        data: null,
        message: error.message || "搜索消息失败",
        code: 400,
      };
      res.status(400).json(response);
    }
  }
}

export const messageController = new MessageController();
