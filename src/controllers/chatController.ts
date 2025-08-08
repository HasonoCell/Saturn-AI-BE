import type { Request, Response } from "express";
import OpenAI from "openai";
import { ResponseData } from "../types/user";

const open_ai = new OpenAI({
  // 如何获取API Key：https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key
  apiKey: "sk-d755685b76b047b2b91c0cf3dbf05059",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export class ChatController {
  /**
   * 发送消息
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res
          .status(400)
          .json({ error: "Invalid request: 'messages' must be an array." });
      }

      const completion = await open_ai.chat.completions.create({
        model: "qwen-turbo",
        messages: messages,
      });

      const response: ResponseData<typeof completion> = {
        data: completion,
        code: 200,
        message: "发送成功",
      };

      res.json(response);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export const chatController = new ChatController();
