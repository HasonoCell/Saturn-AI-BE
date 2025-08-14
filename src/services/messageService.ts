import OpenAI from "openai";
import type {
  MessageType,
  SendMessageParams,
  CreateMessageParams,
} from "../types/message";
import prisma from "../utils/prisma";
import { from, tap, filter, map, finalize, type Observable } from "rxjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export class MessageService {
  /**
   * 创建消息
   */
  private async createMessage(
    params: CreateMessageParams
  ): Promise<MessageType> {
    const { content, role, conversationId } = params;

    if (!content) throw new Error("消息内容不能为空!");
    if (!role) throw new Error("必须指定消息角色!");
    if (!conversationId) throw new Error("必须传入对话ID!");

    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId,
      },
    });

    return message;
  }

  /**
   * 获取上下文消息，简单实现 Context 管理
   */
  private async getContextMessages(
    conversationId: string,
    maxTokens: number = 4000
  ) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      // 从晚到早排序，即获取最新的消息
      orderBy: { createdAt: "desc" },
      take: 10, // 最多取10条
    });

    // 简单的token估算和截断
    let totalTokens = 0;
    const contextMessages = [];

    // 前面获取的是从晚到早排序的消息，这里 reverse 回来，方便 LLM 理解聊天消息的逻辑顺序
    for (const message of messages.reverse()) {
      const estimatedTokens = Math.ceil(message.content.length / 4);
      if (totalTokens + estimatedTokens > maxTokens) break;

      totalTokens += estimatedTokens;
      contextMessages.push({
        role: message.role,
        content: message.content,
      });
    }

    return contextMessages;
  }

  /**
   * 获取对话中的所有消息
   */
  async getAllMessages(
    conversationId: string,
    userId: string
  ): Promise<MessageType[]> {
    if (!conversationId) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入用户ID!");

    // 验证用户是否有权限访问这个对话
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限访问!");
    }

    // 获取消息列表
    const messages = await prisma.message.findMany({
      where: { conversationId },
      // 从早到晚排序
      orderBy: { createdAt: "asc" },
    });

    return messages;
  }

  /**
   * 建立SSE连接中，接收前端用户消息
   */
  async sendUserMessage(params: SendMessageParams): Promise<void> {
    const { content, conversationId, userId } = params;

    if (!content) throw new Error("消息内容不能为空!");
    if (!conversationId) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入用户ID!");

    // 验证用户是否有权限访问这个对话
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限访问!");
    }

    // 保存用户消息到数据库
    await this.createMessage({
      content,
      role: "user",
      conversationId,
    });
  }

  /**
   * 建立SSE连接中，基于对话ID获取AI流式回复
   */
  async getAIStream(
    conversationId: string,
    userId: string
  ): Promise<Observable<string>> {
    if (!conversationId) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入用户ID!");

    // 验证用户是否有权限访问这个对话
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限访问!");
    }

    // 获取对话历史（包含最新的用户消息）
    const contextMessages = await this.getContextMessages(conversationId);

    if (contextMessages.length === 0) {
      throw new Error("对话中没有消息，无法获取AI回复!");
    }

    let aiResponse = "";

    const completion = await openai.chat.completions.create({
      model: "qwen-flash",
      messages: contextMessages as any[],
      stream: true,
      stream_options: {
        // include_usage: true 的情况下，返回的最后一个 chunk 的 choices 数组长度为0，可以通过 chunk.usage 获取 token 使用情况
        include_usage: true,
      },
    });

    const completion$ = from(completion).pipe(
      // 过滤掉最后一个 chunk
      filter((chunk) => chunk.choices && chunk.choices.length > 0),
      map((chunk) => chunk.choices[0]?.delta.content || ""),
      filter((content) => content.length > 0),
      tap((content) => (aiResponse += content)),
      // 等待数据流完成后保存AI消息
      finalize(async () => {
        if (aiResponse) {
          // 保存AI消息到数据库
          await this.createMessage({
            content: aiResponse,
            role: "assistant",
            conversationId,
          });

          // 更新对话的更新时间
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }
      })
    );

    return completion$;
  }
}

export const messageService = new MessageService();
