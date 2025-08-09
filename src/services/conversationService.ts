import type {
  ConversationBase,
  ConversationWithMessages,
  CreateConversationParams,
} from "../types/conversation";
import prisma from "../utils/prisma";

export class ConversationService {
  async createConversation(
    params: CreateConversationParams
  ): Promise<ConversationBase> {
    const { title, description, userId } = params;

    if (!title) throw new Error("对话标题不能为空!");
    if (!userId) throw new Error("必须传入userId!");

    const conversation = await prisma.conversation.create({
      data: {
        title,
        description,
        userId,
      },
    });

    return conversation;
  }

  async getAllConversationsByUserId(
    userId: string
  ): Promise<ConversationBase[]> {
    if (!userId) throw new Error("必须传入userId!");

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return conversations;
  }

  async getSingleConversationById(
    id: string,
    userId: string
  ): Promise<ConversationWithMessages> {
    if (!id) throw new Error("必须传入对话ID!");
    if (!userId) throw new Error("必须传入userId!");

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId, // 确保用户只能访问自己的对话
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      throw new Error("对话不存在或无权限访问!");
    }

    return conversation;
  }

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
