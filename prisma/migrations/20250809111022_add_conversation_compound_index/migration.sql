-- CreateIndex
CREATE INDEX "Conversation_id_userId_idx" ON "Conversation"("id", "userId");

-- CreateIndex
CREATE INDEX "Message_id_conversationId_idx" ON "Message"("id", "conversationId");
