import { Router } from "express";
import { conversationController } from "../controllers";
import { authenticateToken } from "../middlewares";

const router = Router();

// 进行对话路由认证
router.use(authenticateToken);

router.get("/", conversationController.getAllConversationsByUserId);
router.post("/auto", conversationController.autoCreateConversation);
router.get("/:id", conversationController.getSingleConversationById);
router.delete("/:id", conversationController.deleteConversation);

export default router;
