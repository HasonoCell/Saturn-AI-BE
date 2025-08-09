import Router from "express";
import { messageController } from "../controllers";

const router = Router();

router.post("/message", messageController.sendMessage);

export default router;
