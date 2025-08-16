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
  upload.single("chunk"), // 'chunk' 是前端FormData中的字段名
  fileController.uploadChunk
);
router.post("/merge-chunks", fileController.mergeChunks);
router.get("/progress/:uploadId", fileController.getUploadProgress); // 新增进度查询
router.delete("/cancel/:uploadId", fileController.cancelUpload);

export default router;
