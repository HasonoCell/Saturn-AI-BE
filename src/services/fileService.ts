import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  InitUploadParams,
  InitUploadResponse,
  MergeChunksParams,
  MergeChunksResponse,
  UploadEvent,
} from "../types/file";

export class FileService {
  private uploadEventsMap = new Map<string, UploadEvent>();
  private readonly tempDir = path.join(process.cwd(), "uploads/temp");
  private readonly imagesDir = path.join(process.cwd(), "uploads/images");

  constructor() {
    // 确保目录存在
    fs.mkdirSync(this.tempDir, { recursive: true });
    fs.mkdirSync(this.imagesDir, { recursive: true });
  }

  // 初始化上传 (支持断点续传)
  async initUpload(params: InitUploadParams): Promise<InitUploadResponse> {
    // 基于文件MD5检查是否存在未完成的上传
    const existingUpload = this.findExistingUpload(params.md5Hash);

    if (existingUpload) {
      // 恢复现有上传事件
      const uploadedChunks = this.scanUploadedChunks(
        existingUpload.tempDir,
        existingUpload.totalChunks
      );
      existingUpload.uploadedChunks = uploadedChunks;

      return {
        uploadId: existingUpload.uploadId,
        tempDir: existingUpload.tempDir,
        uploadedChunks, // 返回已上传的切片列表
      };
    }

    // 创建新的上传事件
    const uploadId = uuidv4();
    const uploadTempDir = path.join(this.tempDir, uploadId);
    fs.mkdirSync(uploadTempDir, { recursive: true });

    this.uploadEventsMap.set(uploadId, {
      ...params,
      uploadId,
      uploadedChunks: [],
      status: "uploading",
      tempDir: uploadTempDir,
    });

    return { uploadId, tempDir: uploadTempDir, uploadedChunks: [] };
  }

  // 查找现有上传事件
  private findExistingUpload(md5Hash: string): UploadEvent | null {
    for (const upload of this.uploadEventsMap.values()) {
      if (upload.md5Hash === md5Hash && upload.status === "uploading") {
        return upload;
      }
    }
    return null;
  }

  // 扫描已上传的切片
  private scanUploadedChunks(tempDir: string, totalChunks: number): number[] {
    const uploadedChunks: number[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`);
      if (fs.existsSync(chunkPath)) {
        uploadedChunks.push(i);
      }
    }

    return uploadedChunks;
  }

  // 保存切片 (跳过已存在的切片)
  async saveChunk(
    uploadId: string,
    chunkIndex: number,
    chunkBuffer: Buffer
  ): Promise<void> {
    const uploadEvent = this.uploadEventsMap.get(uploadId);
    if (!uploadEvent) throw new Error("上传事件不存在");

    const chunkPath = path.join(uploadEvent.tempDir, `chunk_${chunkIndex}`);

    fs.writeFileSync(chunkPath, chunkBuffer);

    if (!uploadEvent.uploadedChunks.includes(chunkIndex)) {
      uploadEvent.uploadedChunks.push(chunkIndex);
    }
  }

  // 合并切片
  async mergeChunks(params: MergeChunksParams): Promise<MergeChunksResponse> {
    const uploadEvent = this.uploadEventsMap.get(params.uploadId);
    if (!uploadEvent) throw new Error("上传事件不存在");

    // 检查切片完整性
    if (uploadEvent.uploadedChunks.length !== uploadEvent.totalChunks) {
      throw new Error("切片不完整");
    }

    // 生成文件名并合并
    const fileName = `${Date.now()}_${uploadEvent.fileName}`;
    const finalPath = path.join(this.imagesDir, fileName);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < uploadEvent.totalChunks; i++) {
      const chunkPath = path.join(uploadEvent.tempDir, `chunk_${i}`);
      writeStream.write(fs.readFileSync(chunkPath));
    }
    writeStream.end();

    // 等待写入完成
    await new Promise<void>((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // MD5验证
    const finalMD5 = await this.calculateFileMD5(finalPath);
    if (finalMD5 !== uploadEvent.md5Hash) {
      fs.unlinkSync(finalPath);
      throw new Error("文件MD5校验失败");
    }

    // 清理
    this.cleanup(params.uploadId);

    return {
      success: true,
    };
  }

  // 清理资源
  private cleanup(uploadId: string): void {
    const event = this.uploadEventsMap.get(uploadId);
    if (event) {
      try {
        fs.rmSync(event.tempDir, { recursive: true, force: true });
      } catch {}
      this.uploadEventsMap.delete(uploadId);
    }
  }

  // 计算MD5
  private async calculateFileMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("md5");
      const stream = fs.createReadStream(filePath);
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }
}

export const fileService = new FileService();
