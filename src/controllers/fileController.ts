import { Request, Response } from "express";
import { fileService } from "../services/fileService";
import { InitUploadParams, MergeChunksParams } from "../types/file";

export class FileController {
  // 初始化文件上传
  async initUpload(req: Request, res: Response): Promise<void> {
    try {
      const params: InitUploadParams = req.body;

      if (
        !params.fileName ||
        !params.fileSize ||
        !params.totalChunks ||
        !params.md5Hash
      ) {
        res
          .status(400)
          .json({ data: null, message: "缺少必要参数", code: 400 });
        return;
      }

      if (params.fileSize > 200 * 1024 * 1024) {
        res
          .status(400)
          .json({ data: null, message: "文件大小超过限制", code: 400 });
        return;
      }

      const result = await fileService.initUpload(params);
      res.json({ data: result, message: "初始化上传成功", code: 200 });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message, code: 500 });
    }
  }

  // 上传单个切片
  async uploadChunk(
    req: Request & { file?: Express.Multer.File },
    res: Response
  ): Promise<void> {
    try {
      const { uploadId, chunkIndex } = req.body;
      const file = req.file;

      if (!uploadId || chunkIndex === undefined || !file) {
        res
          .status(400)
          .json({ data: null, message: "缺少必要参数", code: 400 });
        return;
      }

      await fileService.saveChunk(uploadId, +chunkIndex, file.buffer);
      res.json({ data: null, message: "切片上传成功", code: 200 });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message, code: 500 });
    }
  }

  // 合并所有切片
  async mergeChunks(req: Request, res: Response): Promise<void> {
    try {
      const params: MergeChunksParams = req.body;

      if (!params.uploadId) {
        res.status(400).json({ data: null, message: "缺少上传ID", code: 400 });
        return;
      }

      const result = await fileService.mergeChunks(params);
      res.json({ data: result, message: "文件合并成功", code: 200 });
    } catch (error: any) {
      res.status(500).json({ data: null, message: error.message, code: 500 });
    }
  }
}

export const fileController = new FileController();
