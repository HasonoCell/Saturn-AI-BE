import { Router } from "express";
import { messageController } from "../controllers";
import { authenticateToken } from "../middlewares";

const router = Router();

// 进行消息路由认证
router.use(authenticateToken);

router.get("/conversations/:conversationId/messages", messageController.getAllMessagesByConversationId);
router.post("/conversations/:conversationId/messages", messageController.sendMessage);

export default router;
