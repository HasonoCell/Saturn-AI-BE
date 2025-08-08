import Router from "express";
import { chatController } from "../controllers/chatController";

const router = Router();

router.post("/message", chatController.sendMessage);

export default router;
