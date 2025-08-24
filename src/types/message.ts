export type MessageRole = "user" | "assistant" | "system" | "function";

export interface MessageType {
  id: string;
  content: string;
  role: MessageRole;
  conversationId: string;
  model: string;
  network: boolean;
  createdAt: Date;
}

// 发送消息的请求参数
export interface SendMessageParams {
  content: string;
  conversationId: string;
  userId: string;
  model: string,
  network: boolean
}

// 创建消息的参数（内部使用）
export interface CreateMessageParams {
  content: string;
  role: MessageRole;
  conversationId: string;
  model: string,
  network: boolean
}

export interface FirstMessageReturn {
  conversationId: string;
  title: string;
}

// 搜索消息的结果项
export interface SearchMessageItem extends MessageType {
  conversationTitle: string;
}

// 搜索消息的请求参数
export interface SearchMessagesParams {
  query: string;
  userId: string;
}
