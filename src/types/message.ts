export type MessageRole = "user" | "assistant" | "system" | "function";

export interface MessageType {
  id: string;
  content: string;
  role: MessageRole;
  conversationId: string;
  createdAt: Date;
}

// 发送消息的请求参数
export interface SendMessageParams {
  content: string;
  conversationId: string;
  userId: string; // 用于权限验证
}

// 创建消息的参数（内部使用）
export interface CreateMessageParams {
  content: string;
  role: MessageRole;
  conversationId: string;
}

export interface FirstMessageReturn {
  conversationId: string;
  title: string;
}
