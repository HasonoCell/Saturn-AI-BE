import { Router } from "express";
import { messageController } from "../controllers";
import { authenticateToken } from "../middlewares";

const router = Router();

router.use(authenticateToken);

// 搜索消息路由
// 实际访问路径：GET /messages/search?query=关键词
router.get("/", messageController.searchMessages);

export default router;
