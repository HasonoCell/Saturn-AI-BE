export interface CreateConversationParams {
  title: string;
  description?: string;
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