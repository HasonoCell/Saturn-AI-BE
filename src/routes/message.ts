import { Router } from "express";
import { messageController } from "../controllers";
import { authenticateToken } from "../middlewares";

const router = Router();

// 进行消息路由认证
router.use(authenticateToken);

// 注意：这些路由会被挂载到 /conversations 路径下
// 所以实际访问路径是：
// GET /conversations/:conversationId/messages
// POST /conversations/:conversationId/messages  
// GET /conversations/:conversationId/messages/stream
router.get(
  "/:conversationId/messages",
  messageController.getAllMessages
);
router.post(
  "/:conversationId/messages",
  messageController.sendUserMessage
);
router.get(
  "/:conversationId/messages/stream",
  messageController.getAIStream
);

export default router;
