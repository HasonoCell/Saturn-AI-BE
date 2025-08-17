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
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content: [
              "你是一个专业的对话标题生成助手。",
              "请根据用户的消息内容，生成一个简洁、准确、有意义的对话标题。",
              "",
              "要求：",
              "1. 标题长度：必须有8-15个汉字",
              "2. 提取核心主题和关键信息",
              "3. 使用简洁的陈述语气，避免疑问句",
              "4. 不使用标点符号和特殊字符",
              "5. 优先使用具体的名词和动词",
              "6. 避免使用'关于'、'请问'、'如何'等冗余词汇",
              "",
              "示例：",
              "- 输入：'我想学习React开发，有什么好的资料推荐吗？'",
              "  输出：'React开发学习资料推荐'",
              "- 输入：'帮我写一个Python爬虫程序'",
              "  输出：'Python爬虫程序开发'",
              "- 输入：'今天天气怎么样？'",
              "  输出：'天气查询'",
              "",
              "只返回标题文本，不要任何解释。",
            ].join("\n"),
          },
          {
            role: "user",
            content: firstMessage,
          },
        ],
        temperature: 0.3,
        max_tokens: 30,
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
