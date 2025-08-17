import { Router } from "express";
import multer from "multer";
import { fileController } from "../controllers";
import { authenticateToken } from "../middlewares";

const router = Router();

// 使用内存存储，文件将被保存在buffer中
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 单个切片最大 5MB
  },
});

router.use(authenticateToken);

router.post("/init-upload", fileController.initUpload);
router.post(
  "/upload-chunk",
  upload.single("chunk"),
  fileController.uploadChunk
);
router.post("/merge-chunks", fileController.mergeChunks);

export default router;
