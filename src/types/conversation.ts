export interface AutoCreateConversationParams {
  firstMessage: string;
  userId: string;
}

export interface ConversationType {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}