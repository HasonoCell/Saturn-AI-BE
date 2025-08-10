import OpenAI from "openai";
import type {
  MessageType,
  SendMessageParams,
  CreateMessageParams,
} from "../types/message";
import prisma from "../utils/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export class MessageService {
  // ! 以下为内部使用的方法，不直接暴露给网络层

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
      take: 20, // 最多取20条
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
        role: message.role as "user" | "assistant" | "system",
        content: message.content,
      });
    }

    return contextMessages;
  }

  /**
   * 调用AI获取回复
   */
  private async callAI(
    contextMessages: any[],
    userMessage: MessageType
  ): Promise<string> {
    try {
      const messages = [...contextMessages, userMessage];

      const completion = await openai.chat.completions.create({
        model: "qwen-flash",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return (
        completion.choices[0]?.message?.content || "抱歉，我没有收到回复。"
      );
    } catch (error) {
      throw new Error("AI服务暂时不可用，请稍后重试");
    }
  }

  // -------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------

  // ! 暴露给网络层的方法

  /**
   * 获取对话中的所有消息
   */
  async getAllMessagesByConversationId(
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
   * 发送消息并获取AI回复
   */
  async sendMessage(params: SendMessageParams): Promise<MessageType> {
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

    // 1. 保存用户消息到数据库
    const userMessage = await this.createMessage({
      content,
      role: "user",
      conversationId,
    });

    // 2. 获取对话历史（用于AI上下文）
    const contextMessages = await this.getContextMessages(conversationId);

    // 3. 调用AI获取回复（此时单纯返回的 Content，需要再包装成 Message 再加入数据库）
    const aiResponse = await this.callAI(contextMessages, userMessage);

    // 4. 保存AI消息
    const aiMessage = await this.createMessage({
      content: aiResponse,
      role: "assistant",
      conversationId,
    });

    // 5. 更新对话的更新时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return aiMessage;
  }
}

export const messageService = new MessageService();
