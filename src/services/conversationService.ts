import type {
  ConversationType,
  AutoCreateConversationParams,
} from "../types/conversation";
import prisma from "../utils/prisma";
import { openai } from "../utils/openai";

export class ConversationService {
  /**
   * 使用AI根据第一条消息生成对话标题
   */
  private async generateConversationTitle(
    firstMessage: string
  ): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "qwen-flash",
        messages: [
          {
            role: "system",
            content:
              "你是一个专门为对话生成简洁标题的助手。请根据用户的第一条消息，生成一个简洁、准确、有意义的对话标题。标题必须在8-20个字之间，能够概括对话的主要内容。标题不应该使用任何标点符号，应该使用陈述语气。只返回标题，不要其他内容。",
          },
          {
            role: "user",
            content: `请为以下消息生成一个对话标题：\n\n${firstMessage}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
      });

      const generatedTitle = completion.choices[0]?.message?.content?.trim();

      // 如果AI生成失败，使用默认标题
      if (!generatedTitle) {
        return "新对话";
      }

      return generatedTitle;
    } catch (error) {
      console.error("AI生成标题失败:", error);
      // AI生成失败时使用备用方案
      return "新对话";
    }
  }

  /**
   * 根据第一条消息自动创建对话
   */
  async autoCreateConversation(
    params: AutoCreateConversationParams
  ): Promise<ConversationType> {
    const { firstMessage, userId } = params;

    if (!firstMessage) throw new Error("第一条消息不能为空!");
    if (!userId) throw new Error("必须传入userId!");

    // 使用AI生成对话标题
    const title = await this.generateConversationTitle(firstMessage);

    const conversation = await prisma.conversation.create({
      data: {
        title,
        description: null,
        userId,
      },
    });

    return conversation;
  }

  /**
   * 获取单条对话
   */
  async getSingleConversationById(
    id: string,
    userId: string
  ): Promise<ConversationType> {
    if (!id) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入userId!");

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId, // 确保用户只能访问自己的对话
      },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限访问!");
    }

    return conversation;
  }

  /**
   * 获取所有对话
   */
  async getAllConversationsByUserId(
    userId: string
  ): Promise<ConversationType[]> {
    if (!userId) throw new Error("必须传入userId!");

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return conversations;
  }

  /**
   * 删除对话
   */
  async deleteConversation(
    id: string,
    userId: string
  ): Promise<{ success: boolean }> {
    if (!id) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入userId!");

    // 检查对话是否属于当前用户
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限删除!");
    }

    await prisma.conversation.delete({
      where: { id },
    });

    return { success: true };
  }
}

export const conversationService = new ConversationService();
