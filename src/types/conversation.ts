import { MessageType } from "./message";

export interface CreateConversationParams {
  title: string;
  description?: string;
  userId: string;
}

export interface ConversationBase {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends ConversationBase {
  messages: MessageType[];
}
